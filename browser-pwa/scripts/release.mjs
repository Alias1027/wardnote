// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Build from an explicit allowlist. Never traverse a live clinical data directory.
import { readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, dirname, join, relative, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';

const ROOT = resolve(import.meta.dirname, '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root, path) => { const rel = relative(root, path); return !isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep); };

export function validatePath(name) {
  if (typeof name !== 'string' || !name || name.includes('\\') || name.includes(':') || name.includes('\0') || name.startsWith('/') || name.split('/').some(p => !p || p === '.' || p === '..')) throw new Error(`Unsafe release path: ${name}`);
  const parts = name.toLowerCase().split('/');
  const leaf = parts.at(-1);
  if (parts.some(p => ['data','work','logs','reference','dist','node_modules','.git'].includes(p)) || leaf.startsWith('.env') || leaf === 'config.local.json' || /\.(db|db-wal|db-shm|sqlite3?|pem|key|pfx|p12|eml|wav|webm|mp3|mp4|m4a|log)$/i.test(leaf)) throw new Error(`Private/runtime path prohibited: ${name}`);
  return name;
}

export function collectFiles(root, names) {
  if (!Array.isArray(names) || new Set(names).size !== names.length) throw new Error('Release allowlist must contain unique paths');
  const realRoot = realpathSync(root);
  return names.map(name => {
    validatePath(name);
    let current = root;
    for (const part of name.split('/')) {
      current = join(current, part);
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Symlink prohibited: ${name}`);
    }
    if (!lstatSync(current).isFile() || !inside(realRoot, realpathSync(current))) throw new Error(`Not a regular source file: ${name}`);
    const bytes = readFileSync(current);
    if (/\.(mjs|js|json|md|yml|ps1|cmd|txt|html|css|csv|webmanifest)$/i.test(name)) {
      const text = bytes.toString('utf8');
      if (/[A-Z]:[\\/]Users[\\/][^\s'"\\/]+/i.test(text) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) || /\bgh[pousr]_[A-Za-z0-9]{30,}\b/.test(text)) throw new Error(`Potential personal path or secret in ${name}; inspect before publishing`);
    }
    return { path: name, size: bytes.length, sha256: hash(bytes), bytes };
  });
}

export function checkMarkdownLinks(files) {
  const published = new Set(files.map(f => f.path));
  for (const f of files.filter(f => f.path.endsWith('.md'))) {
    const text = f.bytes.toString('utf8').replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const link = match[1].replace(/^<|>$/g, '');
      if (/^(https?:|mailto:|#)/i.test(link)) continue;
      const target = decodeURIComponent(link.split('#')[0]);
      const resolved = relative(ROOT, resolve(ROOT, dirname(f.path), target)).split(sep).join('/');
      if (!published.has(resolved)) throw new Error(`Unpublished documentation link: ${f.path} -> ${link}`);
    }
  }
}

export function createRelease(root, destination, names, version) {
  if (existsSync(destination)) throw new Error('Destination already exists; refusing to overwrite');
  const files = collectFiles(root, names);
  checkMarkdownLinks(files);
  mkdirSync(destination, { recursive: true });
  for (const f of files) {
    const path = join(destination, f.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, f.bytes, { flag: 'wx' });
  }
  const manifest = { format: 'wardnote-source/1', version, files: files.map(({bytes, ...f}) => f) };
  writeFileSync(join(destination, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}

export function verifyManifest(root) {
  const manifest = JSON.parse(readFileSync(join(root, 'release-manifest.json'), 'utf8'));
  if (manifest.format !== 'wardnote-source/1') throw new Error('Unknown manifest format');
  const files = collectFiles(root, manifest.files.map(f => f.path));
  for (let i = 0; i < files.length; i++) if (files[i].sha256 !== manifest.files[i].sha256 || files[i].size !== manifest.files[i].size) throw new Error(`Manifest mismatch: ${files[i].path}`);
  return files.length;
}

const crcTable = Array.from({length:256}, (_, value) => {
  for (let bit=0; bit<8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(data) { let crc=0xffffffff; for (const byte of data) crc=crcTable[(crc^byte)&255]^(crc>>>8); return (crc^0xffffffff)>>>0; }

export function writeZip(root, target, files, prefix) {
  if (existsSync(target)) throw new Error('ZIP already exists; refusing to overwrite');
  if (!/^[a-z0-9.-]+$/i.test(prefix)) throw new Error('Invalid archive root');
  if (files.length > 65535) throw new Error('ZIP64 is not supported');
  const chunks=[], directory=[];
  let offset=0;
  for (const path of files) {
    validatePath(path);
    const name=Buffer.from(`${prefix}/${path}`, 'utf8');
    const data=readFileSync(join(root,path)), packed=deflateRawSync(data), crc=crc32(data);
    if (data.length>0xffffffff || packed.length>0xffffffff || name.length>65535) throw new Error('Entry too large');
    const local=Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);
    local.writeUInt16LE(((2026-1980)<<9)|(10<<5)|11,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(packed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
    const central=Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);
    central.writeUInt16LE(((2026-1980)<<9)|(10<<5)|11,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(packed.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
    chunks.push(local,name,packed);directory.push(central,name);offset+=local.length+name.length+packed.length;
  }
  const centralBytes=Buffer.concat(directory), end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(centralBytes.length,12);end.writeUInt32LE(offset,16);
  const archive=Buffer.concat([...chunks,centralBytes,end]);
  writeFileSync(target,archive,{flag:'wx'});
  writeFileSync(target+'.sha256',`${hash(archive)}  ${target.split(sep).at(-1)}\n`,{flag:'wx'});
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if (args.some(a=>!['--check','--zip','--verify'].includes(a))) throw new Error('Usage: node scripts/release.mjs [--check | --zip | --verify]');
  if (args.includes('--verify')) { console.log(`Verified ${verifyManifest(ROOT)} source files`); }
  else {
    const names=JSON.parse(readFileSync(join(ROOT,'scripts/release-files.json'),'utf8'));
    const files=collectFiles(ROOT,names);checkMarkdownLinks(files);
    const version=JSON.parse(readFileSync(join(ROOT,'app/package.json'),'utf8')).version;
    if (args.includes('--check')) console.log(`Publication check passed: ${files.length} allowlisted files, version ${version}`);
    else {
      const name=`wardnote-${version}`, destination=join(ROOT,'dist',name), zip=destination+'.zip';
      if (args.includes('--zip') && (existsSync(zip)||existsSync(zip+'.sha256'))) throw new Error('Archive output already exists');
      createRelease(ROOT,destination,names,version);
      verifyManifest(destination);
      if (args.includes('--zip')) writeZip(destination,zip,[...names,'release-manifest.json'],name);
      console.log(`Prepared ${files.length} public source files in ${destination}`);
    }
  }
}
