// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const exec = promisify(execFile);
// Windows PowerShell 5.1 cold startup can exceed 15 seconds on a busy CI host.
// This is a test-process budget, not an application health-check timeout.
export const LAUNCHER_TEST_TIMEOUT_MS = 45000;

export async function runLauncherProcess(file, args, options = {}) {
  const settings = {windowsHide: true, timeout: LAUNCHER_TEST_TIMEOUT_MS, ...options};
  const started = performance.now();
  try {
    return {code: 0, ...await exec(file, args, settings)};
  } catch (error) {
    // A killed, signalled, missing, or output-overflowed process is not evidence
    // that the launcher intentionally refused an unsafe operation.
    if (Number.isInteger(error.code) && error.code !== 0 && !error.killed && !error.signal) {
      return {code: error.code, stdout: error.stdout || '', stderr: error.stderr || ''};
    }
    const elapsed = Math.round(performance.now() - started);
    throw new Error(
      `Launcher test process did not exit normally after ${elapsed} ms ` +
      `(budget=${settings.timeout} ms, code=${error.code ?? 'none'}, ` +
      `signal=${error.signal ?? 'none'}, killed=${Boolean(error.killed)}).\n` +
      `stdout:\n${error.stdout || '<empty>'}\nstderr:\n${error.stderr || '<empty>'}`,
      {cause: error}
    );
  }
}
