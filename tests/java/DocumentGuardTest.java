package org.wardnote.offline.preview;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;

public final class DocumentGuardTest {
    static int count;
    static void ok(boolean value) { if(!value)throw new AssertionError(); }
    static void passed(String title) { count++;System.out.println("PASS " + title); }
    static class Fake implements DocumentGuard.Provider<String> {
        String id="new", name="part.wnpart"; long bytes=0;
        boolean failOpen, deleteResult=true, failDelete; int opened,deleted;
        ByteArrayOutputStream output=new ByteArrayOutputStream();
        public String create(){return "target";}
        public String identity(String d){return id;}
        public String name(String d){return name;}
        public long size(String d){return bytes;}
        public OutputStream open(String d)throws Exception{opened++;if(failOpen)throw new IOException();return output;}
        public boolean delete(String d)throws Exception{deleted++;if(failDelete)throw new IOException();return deleteResult;}
    }
    static void rejectWithoutTouch(Fake provider,String title)throws Exception {
        boolean rejected=false;
        try{DocumentGuard.createFresh(provider,Collections.singleton("old"),"part.wnpart");}
        catch(IllegalArgumentException expected){rejected=true;}
        ok(rejected&&provider.opened==0&&provider.deleted==0);passed(title);
    }
    public static void main(String[] args)throws Exception {
        Fake fresh=new Fake();DocumentGuard.Opened<String> file=DocumentGuard.createFresh(fresh,Collections.singleton("old"),"part.wnpart");file.output.write(7);
        ok(fresh.opened==1&&fresh.deleted==0&&fresh.output.toByteArray()[0]==7);passed("fresh empty provider file is writable");
        Fake alias=new Fake();alias.id="old";rejectWithoutTouch(alias,"existing document alias never written or deleted");
        Fake nonempty=new Fake();nonempty.bytes=8;rejectWithoutTouch(nonempty,"nonempty new identity never written or deleted");
        Fake unknown=new Fake();unknown.bytes=-1;rejectWithoutTouch(unknown,"unknown size fails closed without deletion");
        Fake renamed=new Fake();renamed.name="old.wnpart";rejectWithoutTouch(renamed,"unexpected name never written or deleted");
        Fake missing=new Fake();missing.id=null;rejectWithoutTouch(missing,"unverifiable identity never written or deleted");
        Fake failed=new Fake();failed.failOpen=true;boolean rejected=false;
        try{DocumentGuard.createFresh(failed,Collections.emptySet(),"part.wnpart");}catch(IOException expected){rejected=true;}
        ok(rejected&&failed.deleted==1);passed("open failure cleans only verified fresh target");
        Fake leftover=new Fake();leftover.failOpen=true;leftover.deleteResult=false;rejected=false;
        try{DocumentGuard.createFresh(leftover,Collections.emptySet(),"part.wnpart");}catch(DocumentGuard.CleanupIncomplete expected){rejected=true;}
        ok(rejected);passed("failed deletion is explicitly incomplete");
        int[] deletions={0};OutputStream badClose=new ByteArrayOutputStream(){public void close()throws IOException{throw new IOException();}};
        ok(DocumentGuard.discard(badClose,()->{deletions[0]++;return true;})&&deletions[0]==1);passed("close failure does not skip deletion attempt");
        ok(!DocumentGuard.discard(null,()->false)&&!DocumentGuard.discard(null,()->{throw new IOException();}));passed("delete false or exception never confirms removal");
        System.out.println("SCENARIOS="+count);
    }
}
