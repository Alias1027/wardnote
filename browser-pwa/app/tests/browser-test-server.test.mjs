// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {EventEmitter} from 'node:events';
import {listenForBrowser} from './browser-test-server.mjs';

const close = server => new Promise((resolve, reject) => {
  server.closeAllConnections();
  if (!server.listening) return resolve();
  server.close(error => error ? reject(error) : resolve());
});
const request = async server => (await fetch(`http://127.0.0.1:${server.address().port}/`, {headers: {connection: 'close'}})).text();

test('browser fixtures never bind a restricted port and keep the selected socket reserved', async () => {
  const server = createServer((req, res) => res.end('fixture'));
  const bound = [], original = server.listen;
  server.listen = function(...args) { bound.push(args[0]); return original.apply(this, args); };
  try {
    await listenForBrowser(server, {ports: [4045, 6000, 10080, ...Array.from({length: 29}, (_, n) => 52000 + n)]});
    assert.ok(bound.length > 0);
    assert.ok(bound.every(port => port >= 49152 && port <= 65535));
    assert.equal(server.address().address, '127.0.0.1');
    assert.equal(await request(server), 'fixture');
  } finally { await close(server); }
});

test('browser fixture bind conflicts preserve the existing server and use another socket', async () => {
  const owner = createServer((req, res) => res.end('existing'));
  const next = createServer((req, res) => res.end('next'));
  try {
    await listenForBrowser(owner);
    const busy = owner.address().port;
    await listenForBrowser(next, {ports: [busy, ...Array.from({length: 31}, (_, n) => 53000 + n)]});
    assert.notEqual(next.address().port, busy);
    assert.equal(await request(owner), 'existing');
    assert.equal(await request(next), 'next');
  } finally { await close(next); await close(owner); }
});

test('exhausted browser fixture allocation fails with the bind cause and leaves the owner running', async () => {
  const owner = createServer((req, res) => res.end('existing'));
  const next = createServer();
  const initial = {error: next.listenerCount('error'), listening: next.listenerCount('listening')};
  try {
    await listenForBrowser(owner);
    const port = owner.address().port;
    await assert.rejects(listenForBrowser(next, {ports: [port, port], maxAttempts: 2}), error => {
      assert.match(error.message, /bounded high-range/);
      assert.equal(error.cause.code, 'EADDRINUSE');
      return true;
    });
    assert.equal(next.listening, false);
    assert.equal(next.listenerCount('error'), initial.error);
    assert.equal(next.listenerCount('listening'), initial.listening);
    assert.equal(await request(owner), 'existing');
  } finally { await close(next); await close(owner); }
});

test('already listening browser fixtures are never closed or rebound', async () => {
  const server = createServer((req, res) => res.end('retained'));
  try {
    await listenForBrowser(server);
    const address = server.address();
    await assert.rejects(listenForBrowser(server), /already listening/);
    assert.deepEqual(server.address(), address);
    assert.equal(await request(server), 'retained');
  } finally { await close(server); }
});

test('unexpected fixture socket errors propagate immediately and remove temporary listeners', async () => {
  const server = new EventEmitter(), failure = Object.assign(new Error('synthetic socket failure'), {code: 'EIO'});
  let calls = 0;
  server.listen = () => { calls++; queueMicrotask(() => server.emit('error', failure)); };
  await assert.rejects(listenForBrowser(server), error => error === failure);
  assert.equal(calls, 1);
  assert.equal(server.listenerCount('error'), 0);
  assert.equal(server.listenerCount('listening'), 0);
});

test('an unusable port list fails without starting a fixture', async () => {
  const server = createServer();
  try {
    await assert.rejects(listenForBrowser(server, {ports: [0, 4045, 6000, 10080]}), /bounded high-range/);
    assert.equal(server.listening, false);
    await assert.rejects(listenForBrowser(server, {maxAttempts: 0}), /Invalid/);
  } finally { await close(server); }
});
