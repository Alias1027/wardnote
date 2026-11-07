// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {randomInt} from 'node:crypto';

// Test fixtures only. Windows can allocate a browser-blocked port for listen(0).
// Use the high dynamic range without disabling browser port protections.
// https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/port_util.cc
function* candidates() {
  const first = randomInt(0, 16384);
  for (let n = 0; n < 32; n++) yield 49152 + (first + n) % 16384;
}

function bind(server, port) {
  return new Promise((resolve, reject) => {
    const clean = () => { server.off('error', failed); server.off('listening', ready); };
    const failed = error => { clean(); reject(error); };
    const ready = () => { clean(); resolve(server); };
    server.once('error', failed);
    server.once('listening', ready);
    try { server.listen(port, '127.0.0.1'); } catch (error) { failed(error); }
  });
}

export async function listenForBrowser(server, {ports = candidates(), maxAttempts = 32} = {}) {
  if (server.listening) throw new Error('Browser test server is already listening');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 32) throw new Error('Invalid browser test bind budget');
  let attempts = 0, lastError;
  for (const port of ports) {
    if (attempts++ >= maxAttempts) break;
    if (!Number.isInteger(port) || port < 49152 || port > 65535) continue;
    try { return await bind(server, port); }
    catch (error) {
      if (!['EADDRINUSE', 'EACCES'].includes(error.code)) throw error;
      lastError = error;
    }
  }
  throw new Error('No available browser test port within the bounded high-range allocation', {cause: lastError});
}
