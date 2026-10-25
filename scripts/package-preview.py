"""Package the exact reviewed Android source. No SDK, data or signing material."""
from pathlib import Path
import argparse
import json
import zipfile
from public_package import check_public, sha, verify_zip

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--revision', choices=['r1', 'combined-1'], default='combined-1')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    version = json.loads((root / 'package.json').read_text('utf-8-sig'))['version']
    records, fixture_count = check_public(root)
    if args.check:
        print(json.dumps({'status': 'passed', 'publicFiles': len(records), 'historicalFixtureEntries': fixture_count,
                          'scope': 'Exact allowlist, path/link boundaries, credential indicators and nested fixture hashes; not an exhaustive secret-detection guarantee'}))
        return
    artifacts = root / 'artifacts'; artifacts.mkdir(exist_ok=True)
    target = artifacts / (f'wardnote-0.6.15-ui-r2-android-{version}-source.zip' if args.revision == 'combined-1' else f'wardnote-android-{version}-source-{args.revision}.zip')
    manifest = {'version': version, 'publicationRevision': args.revision, 'webBase': '0.6.15 UI r2', 'files': records}
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, record in sorted(records.items()):
            raw = (root / name).read_bytes()
            if sha(raw) != record['sha256']: raise RuntimeError('Public file changed during packaging: ' + name)
            info = zipfile.ZipInfo('wardnote-android/' + name, (2026, 10, 23, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED; info.external_attr = 0o100644 << 16
            z.writestr(info, raw)
        info = zipfile.ZipInfo('wardnote-android/SOURCE-MANIFEST.json', (2026, 10, 23, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED; info.external_attr = 0o100644 << 16
        z.writestr(info, json.dumps(manifest, ensure_ascii=False, indent=2).encode('utf-8'))
    verified = verify_zip(target); digest = sha(target.read_bytes())
    target.with_suffix(target.suffix + '.sha256').write_text(digest + '  ' + target.name + '\n', encoding='utf-8')
    report = {'file': target.name, 'version': version, 'publicationRevision': args.revision,
              'files': len(verified['files']) + 1, 'historicalFixtureEntries': fixture_count,
              'bytes': target.stat().st_size, 'sha256': digest,
              'verified': 'Every archive entry read back against manifest; exact public allowlist and historical fixture hashes verified'}
    (root / ('logs/source-package-' + args.revision + '-verification.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report))

if __name__ == '__main__': main()
