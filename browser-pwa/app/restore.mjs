import { existsSync,mkdirSync,copyFileSync,constants } from 'node:fs';
import { resolve,join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
const [sourceArg,directoryArg]=process.argv.slice(2);
if(!sourceArg||!directoryArg){console.error('Usage: node restore.mjs BACKUP.db NEW_DATA_DIRECTORY\nNever restore over a running workspace. Destination wardnote.db must not exist.');process.exit(1);}
const source=resolve(sourceArg),directory=resolve(directoryArg),target=join(directory,'wardnote.db');
if(existsSync(target)||existsSync(target+'-wal')||existsSync(target+'-shm'))throw new Error('Destination contains a database; refusing to overwrite. Choose a new directory.');
const db=new DatabaseSync(source,{readOnly:true});
try{const integrity=db.prepare('PRAGMA integrity_check').get();if(Object.values(integrity)[0]!=='ok')throw new Error('Backup integrity check failed');const meta=db.prepare('SELECT value FROM meta WHERE key=?').get('vault');if(JSON.parse(meta?.value||'{}').format!==1)throw new Error('Unsupported backup format');}finally{db.close();}
mkdirSync(directory,{recursive:true});copyFileSync(source,target,constants.COPYFILE_EXCL);
console.log(`Restored encrypted backup to ${target}\nStart the application with NOTE_DATA_DIR pointing to this directory; use the original password.\nReview historical retention decisions before enabling any cleanup.`);
