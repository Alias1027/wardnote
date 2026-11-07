// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {runLauncherProcess, LAUNCHER_TEST_TIMEOUT_MS} from './launcher-test-support.mjs';

test('launcher harness captures normal success and intentional application refusal', async () => {
  assert.equal(LAUNCHER_TEST_TIMEOUT_MS, 45000);
  const ok = await runLauncherProcess(process.execPath, ['-e', 'console.log("ready"); console.error("diagnostic");']);
  assert.equal(ok.code, 0);
  assert.match(ok.stdout, /ready/);
  assert.match(ok.stderr, /diagnostic/);
  const refused = await runLauncherProcess(process.execPath, ['-e', 'console.error("intentional refusal"); process.exitCode = 1;']);
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /intentional refusal/);
});

test('launcher harness rejects a timeout instead of reporting an application refusal', async () => {
  await assert.rejects(
    runLauncherProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], {timeout: 1000}),
    error => {
      assert.match(error.message, /did not exit normally/);
      assert.match(error.message, /budget=1000 ms/);
      assert.equal(error.cause.killed, true);
      assert.ok(error.cause.signal);
      return true;
    }
  );
});

test('launcher harness preserves missing executable diagnostics', async () => {
  await assert.rejects(
    runLauncherProcess(join(import.meta.dirname, 'missing-launcher-test-executable'), []),
    error => {
      assert.match(error.message, /code=ENOENT/);
      assert.equal(error.cause.code, 'ENOENT');
      assert.match(error.message, /stdout:\n<empty>\nstderr:\n<empty>/);
      return true;
    }
  );
});

test('launcher harness rejects truncated output and retains captured diagnostics', async () => {
  await assert.rejects(
    runLauncherProcess(process.execPath, ['-e', 'process.stdout.write("x".repeat(4096));'], {maxBuffer: 32}),
    error => {
      assert.equal(error.cause.code, 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER');
      assert.match(error.message, /code=ERR_CHILD_PROCESS_STDIO_MAXBUFFER/);
      assert.match(error.message, /stdout:\nx+/);
      return true;
    }
  );
});

// A Windows self-termination is observed as an exit code, not a POSIX signal.
// The timeout case above exercises parent-initiated termination on every OS.
test('launcher harness rejects signal termination', {skip: process.platform === 'win32'}, async () => {
  await assert.rejects(
    runLauncherProcess(process.execPath, ['-e', 'process.kill(process.pid, "SIGTERM");']),
    error => {
      assert.match(error.message, /signal=SIGTERM/);
      assert.equal(error.cause.signal, 'SIGTERM');
      return true;
    }
  );
});
