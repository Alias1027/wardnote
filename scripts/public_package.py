"""Exact public-file boundary. New files must be explicitly reviewed and listed."""
from pathlib import Path, PurePosixPath
import hashlib
import io
import json
import os
import re
import stat
import zipfile

PUBLIC_TREES = ('android', 'web', 'browser-pwa', 'docs', 'tests', 'LICENSES', 'scripts', '.github', 'pdf-templates')
DENIED = {'.p12', '.jks', '.keystore', '.pem', '.key', '.env', '.db', '.sqlite', '.sqlite3', '.wnmanifest', '.wnpart', '.wav', '.mp3', '.m4a', '.ogg', '.webm', '.mp4'}
FIXTURES = {'tests/fixtures/browser-0.6.15-ui-r1.zip', 'tests/fixtures/android-0.1.1-web.zip'}
KEY_MARKER = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----')

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def safe_name(name):
    if not isinstance(name, str) or not name:
        raise ValueError('Invalid public filename')
    p = PurePosixPath(name)
    if '\\' in name or ':' in name or p.is_absolute() or '..' in p.parts or str(p) != name:
        raise ValueError('Unsafe public path: ' + name)
    if p.suffix.lower() in DENIED or 'password' in p.name.lower() or p.name.lower().startswith('.env'):
        raise ValueError('Private or data file is not public: ' + name)
    return p

def check_path(root, name):
    current = root
    for part in safe_name(name).parts:
        current = current / part
        info = current.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise ValueError('Linked public path: ' + name)
    if not current.resolve().is_relative_to(root.resolve()) or not current.is_file():
        raise ValueError('Not a regular in-root file: ' + name)
    return current

def check_content(name, raw):
    if KEY_MARKER.search(raw):
        raise ValueError('Private key material detected: ' + name)
    if re.search(rb'(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16})', raw):
        raise ValueError('Potential credential detected: ' + name)

def check_fixtures(root, paths):
    return check_fixture_payload({p: (root / p).read_bytes() for p in paths if p.lower().endswith('.zip') or p == 'tests/fixtures/manifest.json'})

def check_fixture_payload(payload):
    paths = list(payload)
    archives = {p for p in paths if p.lower().endswith('.zip')}
    if not archives: return 0
    if archives != FIXTURES or 'tests/fixtures/manifest.json' not in paths:
        raise ValueError('Only the two reviewed fixture archives may be public')
    manifest = json.loads(payload['tests/fixtures/manifest.json'].decode('utf-8-sig'))
    if manifest.get('format') != 'wardnote-regression-fixtures-v1' or {'tests/fixtures/' + x['archive'] for x in manifest['archives']} != FIXTURES:
        raise ValueError('Fixture manifest mismatch')
    count = 0
    for record in manifest['archives']:
        name = 'tests/fixtures/' + record['archive']; raw = payload[name]
        if sha(raw) != record['sha256'] or len(raw) != record['bytes']:
            raise ValueError('Fixture archive checksum mismatch: ' + name)
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            names = z.namelist()
            if len(names) != len(set(names)) or set(names) != set(record['files']) or z.testzip():
                raise ValueError('Fixture entry set mismatch')
            for entry in z.infolist():
                safe_name(entry.filename)
                if stat.S_ISLNK(entry.external_attr >> 16) or entry.filename.lower().endswith('.zip'):
                    raise ValueError('Unsafe nested fixture entry')
                content = z.read(entry.filename); expected = record['files'][entry.filename]
                if sha(content) != expected['sha256'] or len(content) != expected['bytes']:
                    raise ValueError('Fixture entry checksum mismatch')
                check_content(name + ':' + entry.filename, content); count += 1
    return count

def check_public(root):
    root = Path(root).resolve()
    allowlist = json.loads(check_path(root, 'scripts/public-files.json').read_text('utf-8-sig'))
    paths = allowlist['files']
    if allowlist.get('format') != 'wardnote-public-files-v1' or not isinstance(paths, list):
        raise ValueError('Unknown public-file allowlist format')
    if len(paths) != len({p.casefold() for p in paths}):
        raise ValueError('Duplicate public-file entry')
    if 'scripts/public-files.json' not in paths:
        raise ValueError('Allowlist must include itself')
    for name in paths:
        check_content(name, check_path(root, name).read_bytes())
    for tree in PUBLIC_TREES:
        base = root / tree
        if not base.exists(): continue
        for current, dirs, files in os.walk(base, followlinks=False):
            for child in list(dirs):
                p = Path(current) / child; info = p.lstat()
                if p.is_symlink() or getattr(info, 'st_file_attributes', 0) & 0x400:
                    raise ValueError('Linked public directory: ' + str(p.relative_to(root)))
                if child == '__pycache__': dirs.remove(child)
            for child in files:
                name = (Path(current) / child).relative_to(root).as_posix()
                if name not in paths: raise ValueError('Unreviewed public-tree file: ' + name)
    for p in root.iterdir():
        if p.is_file() and p.name not in paths: safe_name(p.name)
    fixture_count = check_fixtures(root, paths)
    records = {name: {'bytes': (root / name).stat().st_size, 'sha256': sha((root / name).read_bytes())} for name in sorted(paths)}
    return records, fixture_count

def verify_zip(target):
    with zipfile.ZipFile(target) as z:
        if z.testzip(): raise ValueError('Source ZIP CRC mismatch')
        names = z.namelist(); manifest_name = 'wardnote-android/SOURCE-MANIFEST.json'
        manifest = json.loads(z.read(manifest_name))
        allowlist = json.loads(z.read('wardnote-android/scripts/public-files.json'))
        if allowlist.get('format') != 'wardnote-public-files-v1' or set(allowlist['files']) != set(manifest['files']) or len(allowlist['files']) != len(set(allowlist['files'])):
            raise ValueError('Source ZIP allowlist mismatch')
        expected = {'wardnote-android/' + name for name in manifest['files']} | {manifest_name}
        if len(names) != len(set(names)) or set(names) != expected: raise ValueError('Source ZIP entry set mismatch')
        for name, record in manifest['files'].items():
            safe_name(name); raw = z.read('wardnote-android/' + name)
            if stat.S_ISLNK(z.getinfo('wardnote-android/' + name).external_attr >> 16): raise ValueError('Linked source ZIP entry')
            if len(raw) != record['bytes'] or sha(raw) != record['sha256']: raise ValueError('Source ZIP content mismatch: ' + name)
            check_content(name, raw)
        check_fixture_payload({name: z.read('wardnote-android/' + name) for name in manifest['files'] if name.lower().endswith('.zip') or name == 'tests/fixtures/manifest.json'})
        return manifest
