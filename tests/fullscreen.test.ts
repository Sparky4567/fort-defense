import { test, expect } from 'bun:test';
import { leaveFullscreen } from '../src/fullscreen';
const target = {} as Element;
test('does not exit when refs and fullscreen element are both null', async () => {
  let calls = 0;
  await leaveFullscreen(null, { fullscreenElement: null, exitFullscreen: async () => { calls++; } });
  expect(calls).toBe(0);
});
test('does not exit another element fullscreen', async () => {
  let calls = 0;
  await leaveFullscreen(target, { fullscreenElement: {} as Element, exitFullscreen: async () => { calls++; } });
  expect(calls).toBe(0);
});
test('exits the owned fullscreen element', async () => {
  let calls = 0;
  await leaveFullscreen(target, { fullscreenElement: target, exitFullscreen: async () => { calls++; } });
  expect(calls).toBe(1);
});
test('handles inactive-document rejection without an unhandled promise', async () => {
  await expect(leaveFullscreen(target, { fullscreenElement: target, exitFullscreen: () => Promise.reject(new TypeError('Document not active')) })).resolves.toBeUndefined();
});
test('handles synchronous browser cleanup errors', async () => {
  await expect(leaveFullscreen(target, { fullscreenElement: target, exitFullscreen: () => { throw new TypeError('Document not active'); } })).resolves.toBeUndefined();
});
