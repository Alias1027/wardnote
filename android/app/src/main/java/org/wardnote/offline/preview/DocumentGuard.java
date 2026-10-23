package org.wardnote.offline.preview;

import java.io.OutputStream;
import java.util.Set;

/** Checks run before destructive provider operations; no Android dependency for fault tests. */
final class DocumentGuard {
    interface Provider<T> {
        T create() throws Exception;
        String identity(T document) throws Exception;
        String name(T document) throws Exception;
        long size(T document) throws Exception;
        OutputStream open(T document) throws Exception;
        boolean delete(T document) throws Exception;
    }
    interface Delete { boolean run() throws Exception; }
    static final class CleanupIncomplete extends Exception { }
    static final class Opened<T> {
        final T document; final OutputStream output;
        Opened(T document, OutputStream output) { this.document=document; this.output=output; }
    }
    static <T> Opened<T> createFresh(Provider<T> provider, Set<String> existing, String name) throws Exception {
        T document = provider.create();
        if (document == null) throw new IllegalArgumentException();
        String identity = provider.identity(document);
        // Unverified/aliased targets must never be opened for writing OR deleted.
        if (identity == null || identity.isEmpty() || existing.contains(identity)
            || provider.size(document) != 0 || !name.equals(provider.name(document))) throw new IllegalArgumentException();
        try {
            OutputStream output = provider.open(document);
            if (output == null) throw new IllegalArgumentException();
            return new Opened<>(document, output);
        } catch (Exception error) {
            if (!discard(null, () -> provider.delete(document))) throw new CleanupIncomplete();
            throw error;
        }
    }
    static boolean discard(OutputStream output, Delete delete) {
        // Closing can fail; still attempt deletion, and never claim success without confirmation.
        try { if (output != null) output.close(); } catch (Exception ignored) { }
        try { return delete.run(); } catch (Exception ignored) { return false; }
    }
}
