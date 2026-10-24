import { DatabaseSync, backup } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

export class AppError extends Error { constructor(status,message) { super(message); this.status=status; } }
const derive = (password,salt)=>scryptSync(password,salt,32,{N:32768,r:8,p:1,maxmem:64*1024*1024});
function seal(key,bytes,aad) {
  const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from(aad));
  const ciphertext=Buffer.concat([cipher.update(bytes),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]);
}
function open(key,bytes,aad) {
  const b=Buffer.from(bytes), cipher=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));
  cipher.setAAD(Buffer.from(aad)); cipher.setAuthTag(b.subarray(12,28));
  return Buffer.concat([cipher.update(b.subarray(28)),cipher.final()]);
}
export class Vault {
  constructor(dir) {
    mkdirSync(dir,{recursive:true}); this.dir=dir; this.key=null;
    this.db=new DatabaseSync(join(dir,'wardnote.db'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA secure_delete=ON; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, type TEXT NOT NULL, encounter TEXT NOT NULL, version INTEGER NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, body BLOB NOT NULL);
      CREATE INDEX IF NOT EXISTS record_encounter ON records(encounter);
      CREATE TABLE IF NOT EXISTS revisions (id TEXT NOT NULL, version INTEGER NOT NULL, saved TEXT NOT NULL, body BLOB NOT NULL, PRIMARY KEY(id,version));
      CREATE TABLE IF NOT EXISTS audio (recording TEXT NOT NULL REFERENCES records(id), sequence INTEGER NOT NULL, hash TEXT NOT NULL, size INTEGER NOT NULL, body BLOB NOT NULL, PRIMARY KEY(recording,sequence));
      CREATE TABLE IF NOT EXISTS sync_audio (batch TEXT NOT NULL, recording TEXT NOT NULL, sequence INTEGER NOT NULL, created INTEGER NOT NULL, body BLOB NOT NULL, PRIMARY KEY(batch,recording,sequence));
      CREATE TABLE IF NOT EXISTS authorization_outbox (id TEXT PRIMARY KEY, body BLOB NOT NULL);
      CREATE TABLE IF NOT EXISTS audit (sequence INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT NOT NULL, body BLOB NOT NULL, previous TEXT NOT NULL, hash TEXT NOT NULL);`);
  }
  get initialized() { return !!this.db.prepare('SELECT value FROM meta WHERE key=?').get('vault'); }
  setup(password,clinician) {
    if(this.initialized) throw new AppError(409,'工作区已建立');
    if(typeof password!=='string'||password.length<12||password.length>200) throw new AppError(400,'密码需要 12–200 个字符');
    if(!clinician?.trim()||clinician.length>100) throw new AppError(400,'请填写记录者姓名');
    const salt=randomBytes(16); this.key=randomBytes(32);
    const wrapped=seal(derive(password,salt),this.key,'wardnote-key-v1');
    this.db.prepare('INSERT INTO meta VALUES (?,?)').run('vault',JSON.stringify({format:1,salt:salt.toString('base64'),wrapped:wrapped.toString('base64')}));
    this.put({id:'workspace',type:'settings',encounterId:'',version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),data:{clinician:clinician.trim(),retentionDays:14}});
    this.audit('workspace.created',{format:1});
  }
  unlock(password) {
    if(!this.initialized) throw new AppError(400,'请先建立工作区');
    if(typeof password!=='string'||password.length>200) throw new AppError(401,'密码不正确');
    const m=JSON.parse(this.db.prepare('SELECT value FROM meta WHERE key=?').get('vault').value);
    try { this.key=open(derive(password,Buffer.from(m.salt,'base64')),Buffer.from(m.wrapped,'base64'),'wardnote-key-v1'); }
    catch { throw new AppError(401,'密码不正确'); }
  }
  lock() { if(this.key) this.key.fill(0); this.key=null; }
  assertOpen() { if(!this.key) throw new AppError(401,'工作区已锁定，请重新登录'); }
  decode(row) {
    if(!row) return null; this.assertOpen();
    return {id:row.id,type:row.type,encounterId:row.encounter,version:row.version,createdAt:row.created,updatedAt:row.updated,data:JSON.parse(open(this.key,row.body,`record:${row.id}`).toString('utf8'))};
  }
  get(id) { return this.decode(this.db.prepare('SELECT * FROM records WHERE id=?').get(id)); }
  list() { this.assertOpen(); return this.db.prepare('SELECT * FROM records ORDER BY created,id').all().map(r=>this.decode(r)); }
  put(record) {
    this.assertOpen(); const b=seal(this.key,Buffer.from(JSON.stringify(record.data)),`record:${record.id}`);
    const previous=this.get(record.id);
    if(previous&&previous.version!==record.version&&['note','summary','brief','lab','background','encounter','task','reflection','memo'].includes(record.type)) {
      this.db.prepare('INSERT OR IGNORE INTO revisions VALUES(?,?,?,?)').run(previous.id,previous.version,new Date().toISOString(),seal(this.key,Buffer.from(JSON.stringify(previous)),`revision:${previous.id}:${previous.version}`));
    }
    this.db.prepare('INSERT INTO records VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET encounter=excluded.encounter,version=excluded.version,updated=excluded.updated,body=excluded.body').run(record.id,record.type,record.encounterId,record.version,record.createdAt,record.updatedAt,b);
    return record;
  }
  create(type,encounterId,data) { const now=new Date().toISOString(); return this.put({id:randomUUID(),type,encounterId,version:1,createdAt:now,updatedAt:now,data}); }
  update(id,version,data) {
    const r=this.get(id); if(!r) throw new AppError(404,'记录不存在');
    if(version!==r.version) throw new AppError(409,'其他页面已更新此记录。你的修改仍留在当前页面，请先导出草稿或重新载入后合并。');
    return this.put({...r,version:r.version+1,updatedAt:new Date().toISOString(),data});
  }
  linkReflection(id,version,encounterId) {
    const r=this.get(id),e=this.get(encounterId);
    if(!r||r.type!=='reflection'||!e||e.type!=='encounter')throw new AppError(400,'关联记录或患者不存在');
    if(r.encounterId||version!==r.version)throw new AppError(409,'复盘已关联或已被更新，请重新载入');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const saved=this.put({...r,encounterId,version:r.version+1,updatedAt:new Date().toISOString()});
      this.db.exec('COMMIT');return saved;
    } catch(error) {this.db.exec('ROLLBACK');throw error;}
  }
  addChunk(id,sequence,bytes) {
    const r=this.get(id); if(!r||r.type!=='recording'||r.data.deletedAt) throw new AppError(404,'录音不存在');
    const hash=createHash('sha256').update(bytes).digest('hex');
    const existing=this.db.prepare('SELECT hash FROM audio WHERE recording=? AND sequence=?').get(id,sequence);
    if(existing) { if(existing.hash!==hash) throw new AppError(409,'同序号录音片段内容不同'); return; }
    if(r.data.finalized) throw new AppError(409,'已完成的录音不能追加');
    const total=this.db.prepare('SELECT COALESCE(SUM(size),0) AS n FROM audio WHERE recording=?').get(id).n;
    if(total+bytes.length>256*1024*1024) throw new AppError(413,'单段录音超过 256 MB，请另起一段');
    this.db.prepare('INSERT INTO audio VALUES(?,?,?,?,?)').run(id,sequence,hash,bytes.length,seal(this.key,bytes,`audio:${id}:${sequence}`));
  }
  audioInfo(id) { return this.db.prepare('SELECT sequence,size FROM audio WHERE recording=? ORDER BY sequence').all(id); }
  audioBytes(id) { this.assertOpen(); return Buffer.concat(this.db.prepare('SELECT sequence,body FROM audio WHERE recording=? ORDER BY sequence').all(id).map(r=>open(this.key,r.body,`audio:${id}:${r.sequence}`))); }
  stageChunk(batch,id,sequence,bytes) {this.assertOpen();this.db.prepare('DELETE FROM sync_audio WHERE created<?').run(Date.now()-86400000);this.db.prepare('INSERT OR REPLACE INTO sync_audio VALUES(?,?,?,?,?)').run(batch,id,sequence,Date.now(),seal(this.key,bytes,`sync:${batch}:${id}:${sequence}`));}
  stagedChunk(batch,id,sequence) {this.assertOpen();const r=this.db.prepare('SELECT body FROM sync_audio WHERE batch=? AND recording=? AND sequence=?').get(batch,id,sequence);return r?open(this.key,r.body,`sync:${batch}:${id}:${sequence}`):null;}
  clearStaging(batch) {this.db.prepare('DELETE FROM sync_audio WHERE batch=?').run(batch);}
  resetStaging() {this.db.exec('DELETE FROM sync_audio');}
  putSyncedChunk(id,sequence,bytes) {this.assertOpen();this.db.prepare('INSERT INTO audio VALUES(?,?,?,?,?)').run(id,sequence,createHash('sha256').update(bytes).digest('hex'),bytes.length,seal(this.key,bytes,`audio:${id}:${sequence}`));}
  authorizationGet(id) {this.assertOpen();const r=this.db.prepare('SELECT body FROM authorization_outbox WHERE id=?').get(id);return r?JSON.parse(open(this.key,r.body,`authorization:${id}`).toString()):null;}
  authorizationPut(id,row) {this.assertOpen();this.db.prepare('INSERT OR REPLACE INTO authorization_outbox VALUES(?,?)').run(id,seal(this.key,Buffer.from(JSON.stringify(row)),`authorization:${id}`));}
  audit(action,detail={}) {
    this.assertOpen(); const time=new Date().toISOString();
    const body=seal(this.key,Buffer.from(JSON.stringify({action,...detail})),'audit');
    const previous=this.db.prepare('SELECT hash FROM audit ORDER BY sequence DESC LIMIT 1').get()?.hash||'';
    const hash=createHash('sha256').update(previous).update(time).update(body).digest('hex');
    this.db.prepare('INSERT INTO audit(time,body,previous,hash) VALUES(?,?,?,?)').run(time,body,previous,hash);
  }
  auditList() { this.assertOpen(); return this.db.prepare('SELECT * FROM audit ORDER BY sequence DESC LIMIT 100').all().map(r=>({sequence:r.sequence,time:r.time,hash:r.hash,...JSON.parse(open(this.key,r.body,'audit').toString())})); }
  history(id) { this.assertOpen(); return this.db.prepare('SELECT * FROM revisions WHERE id=? ORDER BY version DESC').all(id).map(r=>JSON.parse(open(this.key,r.body,`revision:${r.id}:${r.version}`).toString())); }
  async backupBytes() {
    const file=join(this.dir,`.backup-${randomUUID()}.db`);
    try { await backup(this.db,file); return readFileSync(file); }
    finally { try { unlinkSync(file); } catch {} }
  }
  close() { this.lock(); this.db.close(); }
}
