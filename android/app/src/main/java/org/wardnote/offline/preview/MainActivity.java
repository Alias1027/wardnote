package org.wardnote.offline.preview;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;
import android.view.View;
import android.view.WindowInsets;
import android.view.DisplayCutout;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Packaged assets and narrow, user-initiated document/recorder operations only. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final int RECORD = 41, OPEN = 42, FOLDER = 43, SAVE = 44;
    private static final int CHUNK_LIMIT = 256 * 1024;
    private static final long FILE_LIMIT = 256L * 1024 * 1024;
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final Map<String, ReadFile> reads = new HashMap<>();
    private final Map<String, WriteFile> writes = new HashMap<>();
    private final Map<String, Uri> folders = new HashMap<>();
    private WebView web;
    private String language = "en", pendingRecord, pendingFolder, pendingSave;
    private String pendingSaveName;
    private ValueCallback<Uri[]> fileChooser;
    private volatile boolean destroyed, rendererGone;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        language = getPreferences(MODE_PRIVATE).getString("ui_language", java.util.Locale.getDefault().getLanguage());
        // Use this application's default private WebView directory on every OS version.
        // Introducing an API-28-only suffix would hide data after an Android OS upgrade.
        WebView.setWebContentsDebuggingEnabled(false);
        web = new WebView(this);
        web.setImportantForAutofill(android.view.View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSaveFormData(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only URIs explicitly returned by the system picker.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setSafeBrowsingEnabled(true);
        web.addJavascriptInterface(new Bridge(), "WardNoteNative");
        web.setWebViewClient(new LocalClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) { request.deny(); }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (intentBusy()) { callback.onReceiveValue(null); return true; }
                fileChooser = callback;
                Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("*/*");
                String[] types = params.getAcceptTypes();
                if (types != null && types.length == 1 && types[0].equals("audio/*")) picker.setType("audio/*");
                picker.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { startActivityForResult(picker, OPEN); }
                catch (ActivityNotFoundException | SecurityException e) { fileChooser = null; callback.onReceiveValue(null); notice("picker"); }
                return true;
            }
        });
        web.setDownloadListener((url, agent, disposition, mime, length) -> notice("export"));
        installInsetHost();
        web.loadUrl(ORIGIN + "/");
    }

    private void installInsetHost() {
        // Target 35 may draw behind system bars. Apply safe padding to the native host,
        // not to web CSS, so fixed controls and every language share the safe viewport.
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        else getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        FrameLayout host = new FrameLayout(this);
        host.setBackgroundColor(0xff143f3a);
        host.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        host.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                Insets keyboard = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, keyboard.bottom));
                return WindowInsets.CONSUMED;
            }
            int left = insets.getSystemWindowInsetLeft(), top = insets.getSystemWindowInsetTop();
            int right = insets.getSystemWindowInsetRight(), bottom = insets.getSystemWindowInsetBottom();
            if (Build.VERSION.SDK_INT >= 28) {
                DisplayCutout cutout = insets.getDisplayCutout();
                if (cutout != null) {
                    left = Math.max(left, cutout.getSafeInsetLeft()); top = Math.max(top, cutout.getSafeInsetTop());
                    right = Math.max(right, cutout.getSafeInsetRight()); bottom = Math.max(bottom, cutout.getSafeInsetBottom());
                }
            }
            view.setPadding(left, top, right, bottom);
            WindowInsets consumed = insets.consumeSystemWindowInsets().consumeStableInsets();
            return Build.VERSION.SDK_INT >= 28 ? consumed.consumeDisplayCutout() : consumed;
        });
        setContentView(host);
        host.requestApplyInsets();
    }

    private final class LocalClient extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !isLocal(request.getUrl());
        }
        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (!isLocal(request.getUrl()) || !"GET".equals(request.getMethod())) return denied(403);
            String path = request.getUrl().getPath();
            if (path == null || path.equals("/")) path = "/index.html";
            if (path.length() > 512 || path.contains("\\") || path.contains("\0")) return denied(403);
            for (String part : path.split("/")) if (part.equals("..") || part.equals(".")) return denied(403);
            try {
                InputStream input = getAssets().open("web" + path);
                Map<String,String> headers = new HashMap<>();
                headers.put("Cache-Control", "no-store");
                headers.put("X-Content-Type-Options", "nosniff");
                headers.put("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self'; frame-src 'none'; object-src 'none'; worker-src 'none'; base-uri 'self'; form-action 'none'");
                return new WebResourceResponse(mime(path), "UTF-8", 200, "OK", headers, input);
            } catch (Exception e) { return denied(404); }
        }
        @Override public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail detail) {
            rendererGone = true;
            view.destroy();
            new AlertDialog.Builder(MainActivity.this).setTitle("WardNote").setMessage(local("restart"))
                .setPositiveButton(android.R.string.ok, (dialog, which) -> recreate()).setCancelable(false).show();
            return true;
        }
    }

    private boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost())
            && uri.getPort() == -1 && uri.getUserInfo() == null;
    }
    private static String mime(String path) {
        if (path.endsWith(".js") || path.endsWith(".mjs")) return "text/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".webmanifest")) return "application/manifest+json";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".woff2")) return "font/woff2";
        if (path.endsWith(".html")) return "text/html";
        return "application/octet-stream";
    }
    private WebResourceResponse denied(int status) {
        return new WebResourceResponse("text/plain", "UTF-8", status, "Unavailable", new HashMap<>(), new ByteArrayInputStream(new byte[0]));
    }

    private final class Bridge {
        @JavascriptInterface public void postMessage(String message) {
            if (destroyed || message == null || message.length() > CHUNK_LIMIT * 2) return;
            try {
                JSONObject request = new JSONObject(message);
                String id = request.getString("id"), method = request.getString("method");
                if (id.length() > 128 || !id.matches("[A-Za-z0-9_.:-]+")) return;
                JSONObject args = request.optJSONObject("args");
                JSONObject actualArgs = args == null ? new JSONObject() : args;
                runOnUiThread(() -> dispatch(id, method, actualArgs));
            } catch (Exception ignored) { /* Do not put patient-bearing input into logs. */ }
        }
    }
    private void dispatch(String id, String method, JSONObject args) {
        if (destroyed || rendererGone || web.getUrl() == null || !isLocal(Uri.parse(web.getUrl()))) return;
        try {
            String requestedLanguage = args.optString("language", args.optString("locale", ""));
            if (!requestedLanguage.isEmpty()) {
                String candidate = requestedLanguage.split("-")[0];
                if (candidate.matches("zh|en|es|fr|ru|ar|hi|ur") && !candidate.equals(language)) {
                    language = candidate;
                    getPreferences(MODE_PRIVATE).edit().putString("ui_language", language).apply();
                }
            }
            switch (method) {
                case "info": {
                    JSONObject result = object("platform", "android", "version", getPackageManager().getPackageInfo(getPackageName(), 0).versionName, "assets", true,
                        "recorderAvailable", recorderIntent().resolveActivity(getPackageManager()) != null);
                    respond(id, result); break;
                }
                case "setLanguage": respond(id, object("language", language)); break;
                case "background": respond(id, object("backgrounded", moveTaskToBack(true))); break;
                case "record": startRecord(id); break;
                case "chooseBackupFolder": chooseFolder(id); break;
                case "chooseSaveFile": chooseSave(id, args); break;
                case "readChunk": case "releaseFile": case "releaseFolder": case "beginFile": case "writeChunk": case "finishFile": case "abortFile":
                    io.execute(() -> fileOperation(id, method, args)); break;
                default: reject(id, "UNSUPPORTED", "This native operation is unavailable.");
            }
        } catch (Exception e) { reject(id, "INVALID_REQUEST", "The native request is invalid."); }
    }
    private boolean intentBusy() { return pendingRecord != null || pendingFolder != null || pendingSave != null || fileChooser != null; }
    private Intent recorderIntent() { return new Intent(MediaStore.Audio.Media.RECORD_SOUND_ACTION); }
    private void startRecord(String id) {
        if (intentBusy()) { reject(id, "BUSY", "A system recorder or document picker is already open."); return; }
        Intent intent = recorderIntent();
        if (intent.resolveActivity(getPackageManager()) == null) { reject(id, "NO_RECORDER", "No system recorder accepts this action. Record separately, then import audio."); return; }
        pendingRecord = id;
        try { startActivityForResult(intent, RECORD); }
        catch (ActivityNotFoundException | SecurityException e) { pendingRecord = null; reject(id, "NO_RECORDER", "The system recorder could not be opened."); }
    }
    private void chooseFolder(String id) {
        if (intentBusy()) { reject(id, "BUSY", "A system dialog is already open."); return; }
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        pendingFolder = id;
        try { startActivityForResult(intent, FOLDER); }
        catch (ActivityNotFoundException | SecurityException e) { pendingFolder = null; reject(id, "NO_PICKER", "The system folder picker is unavailable."); }
    }
    private void chooseSave(String id, JSONObject args) throws Exception {
        if (intentBusy()) { reject(id, "BUSY", "A system dialog is already open."); return; }
        String name = fileName(args.getString("name"));
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(safeType(args.optString("type")));
        intent.putExtra(Intent.EXTRA_TITLE, name);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        pendingSave = id; pendingSaveName = name;
        try { startActivityForResult(intent, SAVE); }
        catch (ActivityNotFoundException | SecurityException e) { pendingSave = null; pendingSaveName = null; reject(id, "NO_PICKER", "The system save dialog is unavailable."); }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        try { handleActivityResult(request, result, data); }
        catch (RuntimeException error) {
            // A malformed provider result must not crash the workspace or expose its payload.
            if (request == OPEN) { ValueCallback<Uri[]> callback=fileChooser; fileChooser=null; if(callback!=null)callback.onReceiveValue(null); }
            String id=request==RECORD?pendingRecord:request==FOLDER?pendingFolder:request==SAVE?pendingSave:null;
            if(request==RECORD)pendingRecord=null;
            if(request==FOLDER)pendingFolder=null;
            if(request==SAVE){pendingSave=null;pendingSaveName=null;}
            if(id!=null)reject(id,"FILE_ACCESS","The system result could not be used.");
        }
    }
    private void handleActivityResult(int request, int result, Intent data) {
        Uri uri = data == null ? null : data.getData();
        if (uri == null && data != null && data.getClipData() != null && data.getClipData().getItemCount() == 1) uri = data.getClipData().getItemAt(0).getUri();
        if (request == OPEN) {
            if (fileChooser == null) return;
            if (result != RESULT_OK || data == null) { completeFileChoice(null); return; }
            ClipData clip = data.getClipData();
            if (clip != null && clip.getItemCount() > 0 && clip.getItemCount() <= 10001) {
                Uri[] uris = new Uri[clip.getItemCount()];
                for (int i = 0; i < uris.length; i++) { uris[i] = clip.getItemAt(i).getUri(); if (!contentUri(uris[i])) { completeFileChoice(null); return; } }
                completeFileChoice(uris);
            } else completeFileChoice(contentUri(uri) ? new Uri[]{uri} : null);
            return;
        }
        String id = request == RECORD ? pendingRecord : request == FOLDER ? pendingFolder : request == SAVE ? pendingSave : null;
        String saveName = pendingSaveName;
        if (request == RECORD) pendingRecord = null;
        if (request == FOLDER) pendingFolder = null;
        if (request == SAVE) { pendingSave = null; pendingSaveName = null; }
        if (id == null) { if (request == RECORD && result == RESULT_OK) notice("orphan"); return; }
        if (result != RESULT_OK) { reject(id, "CANCELLED", "The system operation was cancelled."); return; }
        if (!contentUri(uri)) { reject(id, "NO_FILE", "No readable content URI was returned. Import the recording manually."); return; }
        Uri chosen = uri;
        io.execute(() -> {
            try {
                if (request == RECORD) {
                    ReadFile file = describe(chosen); String token = token(); reads.put(token, file);
                    respond(id, object("token", token, "name", file.name, "type", file.type, "size", file.size));
                } else if (request == FOLDER) {
                    if (!DocumentsContract.isTreeUri(chosen)) throw new IllegalArgumentException();
                    String token = token(); folders.put(token, chosen); respond(id, object("token", token));
                } else if (request == SAVE) {
                    // ACTION_CREATE_DOCUMENT must create an empty file; reject existing content.
                    if (existingSize(chosen) != 0) throw new IllegalArgumentException();
                    WriteFile file = new WriteFile(chosen, saveName, getContentResolver().openOutputStream(chosen, "w"));
                    if (file.output == null) throw new IllegalArgumentException();
                    String token = token(); writes.put(token, file); respond(id, object("token", token));
                }
            } catch (Exception e) { reject(id, "FILE_ACCESS", "The selected file or folder could not be read or written."); }
        });
    }
    private void completeFileChoice(Uri[] uris) {
        ValueCallback<Uri[]> callback=fileChooser;fileChooser=null;
        if(callback!=null)callback.onReceiveValue(uris);
    }
    private static boolean contentUri(Uri uri) { return uri != null && "content".equals(uri.getScheme()) && uri.getAuthority()!=null && !uri.getAuthority().isEmpty() && uri.getFragment()==null; }

    private void fileOperation(String id, String method, JSONObject args) {
        String selected = args.optString("token");
        try {
            switch (method) {
                case "releaseFile": {
                    ReadFile file = reads.remove(selected); if (file != null && file.input != null) file.input.close();
                    respond(id, object("released", true)); break;
                }
                case "releaseFolder": folders.remove(selected); respond(id, object("released", true)); break;
                case "readChunk": {
                    ReadFile file = reads.get(selected); if (file == null) throw new IllegalArgumentException();
                    long offset = args.getLong("offset"); int length = args.getInt("length");
                    if (offset < 0 || offset > file.size || length < 1 || length > CHUNK_LIMIT) throw new IllegalArgumentException();
                    byte[] buffer = new byte[(int)Math.min(length, file.size - offset)]; int total = 0;
                    if (file.input == null || file.position != offset) {
                        if (file.input != null) file.input.close();
                        file.input = getContentResolver().openInputStream(file.uri); file.position = 0;
                        if (file.input == null) throw new IllegalArgumentException();
                        while (file.position < offset) {
                            long n = file.input.skip(offset - file.position);
                            if (n == 0) { if (file.input.read() < 0) throw new IllegalArgumentException(); n = 1; }
                            file.position += n;
                        }
                    }
                    while (total < buffer.length) { int n = file.input.read(buffer, total, buffer.length - total); if (n < 0) break; total += n; file.position += n; }
                    if (total != buffer.length) throw new IllegalArgumentException();
                    if (offset + total == file.size && file.input.read() != -1) {
                        reject(id, "FILE_CHANGED", "The source recording changed during import. Select it again."); return;
                    }
                    respond(id, object("base64", Base64.encodeToString(buffer, Base64.NO_WRAP), "eof", offset + total >= file.size)); break;
                }
                case "beginFile": {
                    String name = fileName(args.getString("name")); Uri tree = folders.get(args.getString("folder"));
                    if (tree == null) throw new IllegalArgumentException();
                    String parentId = DocumentsContract.getTreeDocumentId(tree);
                    Uri childList = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parentId);
                    Set<String> existing = new HashSet<>();
                    try (Cursor cursor = getContentResolver().query(childList, new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME}, null, null, null)) {
                        if (cursor == null) throw new IllegalArgumentException();
                        while (cursor.moveToNext()) {
                            String childId=cursor.getString(0); if(childId==null)throw new IllegalArgumentException(); existing.add(childId);
                            if (name.equals(cursor.getString(1))) { reject(id, "FILE_EXISTS", "A backup file with this name already exists. Choose an empty folder."); return; }
                        }
                    }
                    Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, parentId);
                    DocumentGuard.Opened<Uri> opened = DocumentGuard.createFresh(new DocumentGuard.Provider<Uri>() {
                        public Uri create() throws Exception { return DocumentsContract.createDocument(getContentResolver(), parent, safeType(args.optString("type")), name); }
                        public String identity(Uri document) {
                            if (!contentUri(document) || !tree.getAuthority().equals(document.getAuthority())) throw new IllegalArgumentException();
                            return DocumentsContract.getDocumentId(document);
                        }
                        public String name(Uri document) { return displayName(document, ""); }
                        public long size(Uri document) { return existingSize(document); }
                        public OutputStream open(Uri document) throws Exception { return getContentResolver().openOutputStream(document, "w"); }
                        public boolean delete(Uri document) throws Exception { return DocumentsContract.deleteDocument(getContentResolver(), document); }
                    }, existing, name);
                    String token = token(); writes.put(token, new WriteFile(opened.document, name, opened.output)); respond(id, object("token", token));
                    break;
                }
                case "writeChunk": {
                    WriteFile file = writes.get(selected); if (file == null) throw new IllegalArgumentException();
                    String encoded = args.getString("base64"); if (encoded.length() > CHUNK_LIMIT * 2) throw new IllegalArgumentException();
                    byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
                    if (bytes.length > CHUNK_LIMIT || file.size + bytes.length > FILE_LIMIT) throw new IllegalArgumentException();
                    file.output.write(bytes); file.size += bytes.length; respond(id, object("size", file.size)); break;
                }
                case "finishFile": {
                    WriteFile file = writes.get(selected); if (file == null) throw new IllegalArgumentException();
                    file.output.flush(); file.output.close(); file.output = null;
                    MessageDigest digest = MessageDigest.getInstance("SHA-256"); long size = 0;
                    try (InputStream input = getContentResolver().openInputStream(file.uri)) {
                        if (input == null) throw new IllegalArgumentException();
                        byte[] bytes = new byte[32768]; int count;
                        while ((count = input.read(bytes)) != -1) { size += count; if (size > FILE_LIMIT) throw new IllegalArgumentException(); digest.update(bytes, 0, count); }
                    }
                    String hash = hex(digest.digest()), expected = args.optString("sha256");
                    if (size != file.size || (!expected.isEmpty() && !hash.equalsIgnoreCase(expected))) {
                        boolean removed=discard(selected); reject(id, removed?"VERIFY_FAILED":"CLEANUP_INCOMPLETE", "Export verification failed; cleanup confirmation is required if removal failed."); return;
                    }
                    writes.remove(selected); respond(id, object("size", size, "sha256", hash)); break;
                }
                case "abortFile": respond(id, object("removed", discard(selected))); break;
                default: throw new IllegalArgumentException();
            }
        } catch (Exception e) { reject(id, e instanceof DocumentGuard.CleanupIncomplete?"CLEANUP_INCOMPLETE":"FILE_ACCESS", "The file operation failed. The original patient records remain in this app."); }
    }

    private ReadFile describe(Uri uri) throws Exception {
        String name = displayName(uri, "recording.audio"), type = getContentResolver().getType(uri);
        if (type == null || type.isEmpty()) type = "application/octet-stream";
        long size = existingSize(uri);
        if (size < 0) {
            size = 0;
            try (InputStream input = getContentResolver().openInputStream(uri)) {
                if (input == null) throw new IllegalArgumentException();
                byte[] buffer = new byte[32768]; int count;
                while ((count = input.read(buffer)) != -1) { size += count; if (size > FILE_LIMIT) throw new IllegalArgumentException(); }
            }
        }
        if (size < 1 || size > FILE_LIMIT) throw new IllegalArgumentException();
        return new ReadFile(uri, name, type, size);
    }
    private long existingSize(Uri uri) {
        try (Cursor cursor = getContentResolver().query(uri, new String[]{OpenableColumns.SIZE}, null, null, null)) {
            if (cursor != null && cursor.moveToFirst() && !cursor.isNull(0)) return cursor.getLong(0);
        } catch (Exception ignored) { }
        return -1;
    }
    private String displayName(Uri uri, String fallback) {
        try (Cursor cursor = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (cursor != null && cursor.moveToFirst() && !cursor.isNull(0)) return cursor.getString(0);
        } catch (Exception ignored) { }
        return fallback;
    }
    private static String fileName(String name) {
        if (name == null || name.isEmpty() || name.length() > 180 || name.contains("/") || name.contains("\\") || name.contains("..") || name.matches(".*[\\p{Cntrl}].*")) throw new IllegalArgumentException();
        return name;
    }
    private static String safeType(String type) { return type != null && type.matches("[a-zA-Z0-9.+-]+/[a-zA-Z0-9.+-]+") ? type : "application/octet-stream"; }
    private boolean discard(String token) {
        WriteFile file = writes.remove(token);
        return file != null && DocumentGuard.discard(file.output, () -> DocumentsContract.deleteDocument(getContentResolver(), file.uri));
    }
    private static String token() { return UUID.randomUUID().toString(); }
    private static String hex(byte[] bytes) { StringBuilder value = new StringBuilder(); for (byte b : bytes) value.append(String.format(java.util.Locale.ROOT, "%02x", b & 0xff)); return value.toString(); }
    private static JSONObject object(Object... pairs) throws Exception {
        JSONObject result = new JSONObject(); for (int i = 0; i < pairs.length; i += 2) result.put((String)pairs[i], pairs[i+1]); return result;
    }
    private void respond(String id, JSONObject result) {
        try { deliver(object("id", id, "ok", true, "result", result)); } catch (Exception ignored) { }
    }
    private void reject(String id, String code, String message) {
        try { deliver(object("id", id, "ok", false, "error", object("code", code, "message", message))); } catch (Exception ignored) { }
    }
    private void deliver(JSONObject result) {
        runOnUiThread(() -> { if (!destroyed && !rendererGone) web.evaluateJavascript("window.__wardnoteNativeResult&&window.__wardnoteNativeResult(" + result.toString() + ");", null); });
    }
    private void notice(String key) { runOnUiThread(() -> Toast.makeText(this, local(key), Toast.LENGTH_LONG).show()); }

    @Override public void onBackPressed() {
        // Web code owns unsaved-record and recording protections; never force a reload/exit.
        if (!rendererGone) web.evaluateJavascript("if(window.__wardnoteNativeBack){window.__wardnoteNativeBack()}else{false}", null);
    }
    @Override protected void onDestroy() {
        destroyed = true;
        if (fileChooser != null) { fileChooser.onReceiveValue(null); fileChooser = null; }
        io.execute(() -> {
            for (String key : writes.keySet().toArray(new String[0])) try { discard(key); } catch (Exception ignored) { }
            for (ReadFile file : reads.values()) try { if (file.input != null) file.input.close(); } catch (Exception ignored) { }
            reads.clear(); folders.clear();
        });
        io.shutdown();
        if (!rendererGone) { web.removeJavascriptInterface("WardNoteNative"); web.destroy(); }
        super.onDestroy();
    }
    private static final class ReadFile {
        final Uri uri; final String name, type; final long size; InputStream input; long position;
        ReadFile(Uri uri, String name, String type, long size) { this.uri=uri; this.name=name; this.type=type; this.size=size; }
    }
    private static final class WriteFile {
        final Uri uri; final String name; OutputStream output; long size;
        WriteFile(Uri uri, String name, OutputStream output) { this.uri=uri; this.name=name; this.output=output; }
    }

    private String local(String key) {
        String[] languages={"en","zh","es","fr","ru","ar","hi","ur"}; int index=0;
        for(int i=0;i<languages.length;i++) if(languages[i].equals(language)){index=i;break;}
        switch(key) {
            case "orphan": return new String[]{
                "WardNote restarted while recording. Import the audio manually and confirm the patient.",
                "录音期间应用已重启。请手动导入录音并重新确认患者。",
                "WardNote se reinició durante la grabación. Importe el audio y confirme el paciente.",
                "WardNote a redémarré pendant l’enregistrement. Importez l’audio et confirmez le patient.",
                "WardNote перезапущен во время записи. Импортируйте аудио и подтвердите пациента.",
                "أُعيد تشغيل WardNote أثناء التسجيل. استورد الصوت يدويًا وأكّد المريض.",
                "रिकॉर्डिंग के दौरान WardNote फिर शुरू हुआ। ऑडियो आयात करें और रोगी की पुष्टि करें।",
                "ریکارڈنگ کے دوران WardNote دوبارہ شروع ہوا۔ آڈیو درآمد کریں اور مریض کی تصدیق کریں۔"}[index];
            case "restart": return new String[]{
                "The display process stopped. Reopen the local workspace; saved encrypted records are retained. Unsaved input may need to be re-entered.",
                "显示进程已停止。请重新打开本地工作区；已保存的加密记录仍保留，未保存输入可能需重新填写。",
                "La pantalla se detuvo. Reabra el espacio local. Se conservan los registros cifrados guardados; revise los datos no guardados.",
                "L’affichage s’est arrêté. Rouvrez l’espace local. Les données chiffrées enregistrées restent conservées ; vérifiez les saisies non enregistrées.",
                "Процесс отображения остановлен. Откройте локальное пространство. Сохранённые зашифрованные записи остаются; несохранённый ввод может потребоваться повторить.",
                "توقفت واجهة العرض. أعد فتح مساحة العمل المحلية. تبقى السجلات المشفرة المحفوظة؛ قد يلزم إدخال البيانات غير المحفوظة مجددًا.",
                "प्रदर्शन प्रक्रिया रुक गई। स्थानीय कार्यक्षेत्र फिर खोलें। सहेजे गए एन्क्रिप्टेड रिकॉर्ड सुरक्षित हैं; बिना सहेजे इनपुट फिर भरने पड़ सकते हैं।",
                "ڈسپلے رک گیا۔ مقامی ورک اسپیس دوبارہ کھولیں۔ محفوظ کردہ خفیہ ریکارڈ برقرار ہیں؛ غیر محفوظ اندراج دوبارہ کرنا پڑ سکتا ہے۔"}[index];
            case "picker": return new String[]{"System file picker unavailable.","系统文件选择器不可用。","Selector de archivos no disponible.","Sélecteur de fichiers indisponible.","Выбор файлов недоступен.","منتقي الملفات غير متاح.","सिस्टम फ़ाइल चयन उपलब्ध नहीं है।","سسٹم فائل انتخاب دستیاب نہیں۔"}[index];
            default: return new String[]{"Use the app’s export or backup controls to save files.","请使用应用内的导出或备份功能保存文件。","Use los controles de exportación o copia de seguridad.","Utilisez les fonctions d’export ou de sauvegarde.","Используйте экспорт или резервное копирование в приложении.","استخدم أدوات التصدير أو النسخ الاحتياطي في التطبيق.","फ़ाइल सहेजने के लिए ऐप का निर्यात या बैकअप उपयोग करें।","فائل محفوظ کرنے کے لیے ایپ کا برآمد یا بیک اپ استعمال کریں۔"}[index];
        }
    }
}
