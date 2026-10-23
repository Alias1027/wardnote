"""Public-boundary regressions use a synthetic isolated tree, never real signing files."""
from pathlib import Path
import json
import hashlib
import io
import os
import subprocess
import sys
import tempfile
import unittest
import zipfile
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from public_package import check_public, verify_zip

class PublicBoundaryTests(unittest.TestCase):
    def setUp(self):
        scratch = Path(__file__).resolve().parents[1] / '.test-tmp'
        scratch.mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='public-package-', dir=scratch)
        if not Path(self.temp.name).resolve().is_relative_to(scratch.resolve()):
            raise RuntimeError('Unexpected test directory')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'scripts').mkdir(); (self.root / 'docs').mkdir()
        (self.root / 'README.md').write_text('Synthetic release test')
        self.paths = ['README.md', 'scripts/public-files.json']; self.save()

    def save(self):
        (self.root / 'scripts/public-files.json').write_text(json.dumps({'format': 'wardnote-public-files-v1', 'files': self.paths}))

    def test_exact_safe_set_passes(self):
        files, count = check_public(self.root)
        self.assertEqual(set(files), set(self.paths)); self.assertEqual(count, 0)

    def test_unreviewed_document_rejected(self):
        (self.root / 'docs/accidental.txt').write_text('Not reviewed')
        with self.assertRaisesRegex(ValueError, 'Unreviewed'): check_public(self.root)

    def test_private_extension_rejected_even_if_listed(self):
        (self.root / 'docs/signing.key').write_text('Synthetic only')
        self.paths.append('docs/signing.key'); self.save()
        with self.assertRaisesRegex(ValueError, 'Private'): check_public(self.root)

    def test_secret_marker_rejected_in_allowed_text(self):
        (self.root / 'README.md').write_text('-----BEGIN ' + 'PRIVATE KEY-----\nsynthetic')
        with self.assertRaisesRegex(ValueError, 'Private key'): check_public(self.root)

    def test_case_duplicate_rejected(self):
        self.paths.append('readme.md'); self.save()
        with self.assertRaisesRegex(ValueError, 'Duplicate'): check_public(self.root)

    def test_parent_traversal_rejected(self):
        self.paths.append('../outside.txt'); self.save()
        with self.assertRaisesRegex(ValueError, 'Unsafe'): check_public(self.root)

    def test_unapproved_archive_rejected(self):
        (self.root / 'docs/unknown.zip').write_bytes(b'not a real archive')
        self.paths.append('docs/unknown.zip'); self.save()
        with self.assertRaisesRegex(ValueError, 'Only the two'): check_public(self.root)

    def test_missing_listed_file_rejected(self):
        self.paths.append('docs/missing.txt'); self.save()
        with self.assertRaises(FileNotFoundError): check_public(self.root)

    @unittest.skipUnless(os.name == 'nt', 'Windows junction boundary')
    def test_windows_junction_rejected(self):
        target = self.root / 'outside-public'; target.mkdir()
        (target / 'note.txt').write_text('Synthetic only')
        link = self.root / 'docs/linked'
        quote = lambda p: "'" + str(p).replace("'", "''") + "'"
        command = 'New-Item -ItemType Junction -Path ' + quote(link) + ' -Target ' + quote(target) + ' | Out-Null'
        result = subprocess.run(['pwsh.exe', '-NoProfile', '-Command', command], capture_output=True)
        self.assertEqual(result.returncode, 0, 'Could not create synthetic junction')
        try:
            self.paths.append('docs/linked/note.txt'); self.save()
            with self.assertRaisesRegex(ValueError, 'Linked'): check_public(self.root)
        finally:
            result = subprocess.run(['pwsh.exe', '-NoProfile', '-Command', 'Remove-Item -LiteralPath ' + quote(link)], capture_output=True)
            self.assertEqual(result.returncode, 0, 'Could not remove synthetic junction')

    def fixture(self, extra=False, wrong_hash=False):
        folder = self.root / 'tests/fixtures'; folder.mkdir(parents=True)
        archives = []
        for name in ['browser-0.6.15-ui-r1.zip', 'android-0.1.1-web.zip']:
            output = io.BytesIO(); content = b'Synthetic source only'
            with zipfile.ZipFile(output, 'w') as z:
                z.writestr('source.js', content)
                if extra: z.writestr('unexpected.txt', b'Unexpected')
            raw = output.getvalue(); (folder / name).write_bytes(raw)
            archives.append({'archive': name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(),
                             'files': {'source.js': {'bytes': len(content), 'sha256': '0'*64 if wrong_hash else hashlib.sha256(content).hexdigest()}}})
            self.paths.append('tests/fixtures/' + name)
        (folder / 'manifest.json').write_text(json.dumps({'format': 'wardnote-regression-fixtures-v1', 'archives': archives}))
        self.paths.append('tests/fixtures/manifest.json'); self.save()

    def test_fixture_unknown_entry_rejected(self):
        self.fixture(extra=True)
        with self.assertRaisesRegex(ValueError, 'entry set'): check_public(self.root)

    def test_fixture_wrong_entry_hash_rejected(self):
        self.fixture(wrong_hash=True)
        with self.assertRaisesRegex(ValueError, 'entry checksum'): check_public(self.root)

    def test_zip_self_manifest_cannot_expand_allowlist(self):
        payload = {p: (self.root / p).read_bytes() for p in self.paths}
        payload['docs/unlisted.txt'] = b'Not approved'
        manifest = {'files': {p: {'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()} for p, raw in payload.items()}}
        target = self.root / 'candidate.zip'
        with zipfile.ZipFile(target, 'w') as z:
            for name, raw in payload.items(): z.writestr('wardnote-android/' + name, raw)
            z.writestr('wardnote-android/SOURCE-MANIFEST.json', json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, 'allowlist mismatch'): verify_zip(target)

if __name__ == '__main__': unittest.main()
