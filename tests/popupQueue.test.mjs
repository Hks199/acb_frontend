import test from 'node:test';
import assert from 'node:assert/strict';
import { createPopupQueue, POPUP_SESSION_KEY, POPUP_COMPLETED_KEY } from '../src/helper/popupQueue.js';
const store = () => { const map = new Map(); return { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, value) }; };
const campaigns = [1, 2, 3].map((id) => ({ _id: String(id), priority_order: id, title: `Campaign ${id}`, isActive: true }));
function setup() {
  let now = 1000000, sequence = 0;
  const timers = new Map(), changes = [];
  const session = store(), local = store();
  const create = () => createPopupQueue({ sessionStorage: session, localStorage: local, now: () => now,
    onChange: (campaign) => changes.push(campaign?._id || null),
    setTimer: (callback, delay) => { const id = ++sequence; timers.set(id, { at: now + delay, callback }); return id; }, clearTimer: (id) => timers.delete(id),
  });
  const advance = (milliseconds) => {
    const end = now + milliseconds;
    for (;;) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].callback();
    }
    now = end;
  };
  return { create, advance, changes, session, local, timers };
}
test('first campaign waits 5 seconds; every dismissal waits exactly 90 seconds and the queue finishes', () => {
  const app = setup(), queue = app.create(); queue.setCampaigns([...campaigns].reverse());
  app.advance(4999); assert.deepEqual(app.changes, []);
  app.advance(1); assert.deepEqual(app.changes, ['1']);
  app.advance(200000); assert.equal(queue.getState().activePopupId, '1');
  queue.dismiss(); assert.equal(queue.getState().nextQueueIndex, 1);
  app.advance(89999); assert.equal(app.changes.at(-1), null);
  app.advance(1); assert.equal(app.changes.at(-1), '2');
  queue.dismiss(); app.advance(90000); assert.equal(app.changes.at(-1), '3');
  queue.dismiss(); app.advance(300000); assert.equal(app.changes.at(-1), null); assert.equal(app.timers.size, 0);
});
test('reload preserves the initial delay, an open popup, and remaining dismissal cooldown', () => {
  const app = setup(); let queue = app.create(); queue.setCampaigns(campaigns);
  app.advance(2000); queue.dispose(); queue = app.create(); queue.setCampaigns(campaigns);
  app.advance(2999); assert.equal(app.changes.length, 0); app.advance(1); assert.equal(app.changes.at(-1), '1');
  queue.dispose(); queue = app.create(); queue.setCampaigns(campaigns); assert.equal(app.changes.at(-1), '1');
  queue.dismiss(); app.advance(30000); queue.dispose(); queue = app.create(); queue.setCampaigns(campaigns);
  app.advance(59999); assert.equal(app.changes.at(-1), null); app.advance(1); assert.equal(app.changes.at(-1), '2');
});
test('completed CTAs are excluded across browser sessions; late completions do not dismiss another campaign', () => {
  const app = setup(); let queue = app.create(); queue.setCampaigns(campaigns); app.advance(5000);
  queue.complete('1'); assert.deepEqual(JSON.parse(app.local.getItem(POPUP_COMPLETED_KEY)), ['1']);
  app.advance(90000); assert.equal(queue.getState().activePopupId, '2');
  queue.complete('1'); assert.equal(queue.getState().activePopupId, '2');
  queue.dispose(); app.session.setItem(POPUP_SESSION_KEY, 'null'); queue = app.create(); queue.setCampaigns(campaigns);
  app.advance(5000); assert.equal(queue.getState().activePopupId, '2');
});
test('refreshes and reordered campaigns keep deadlines, skip inactive/expired items, and never replay dismissed IDs', () => {
  const app = setup(), queue = app.create();
  queue.setCampaigns([...campaigns, { _id: '4', priority_order: 0, isActive: false }, { _id: '5', priority_order: 0, isActive: true, endsAt: new Date(999999).toISOString() }]);
  app.advance(5000); assert.equal(queue.getState().activePopupId, '1'); queue.dismiss();
  app.advance(45000); queue.setCampaigns([campaigns[0], { ...campaigns[2], priority_order: 1 }, { ...campaigns[1], priority_order: 3 }]);
  app.advance(44999); assert.equal(queue.getState().activePopupId, null); app.advance(1); assert.equal(queue.getState().activePopupId, '3');
  queue.setCampaigns([campaigns[0], campaigns[1]]); assert.equal(queue.getState().activePopupId, null);
  app.advance(90000); assert.equal(queue.getState().activePopupId, '2');
});
test('empty campaigns, delayed API data, malformed or unavailable storage and disposal are safe', () => {
  const app = setup(), queue = app.create(); queue.setCampaigns([]); app.advance(10000);
  queue.setCampaigns(campaigns); app.advance(0); assert.equal(queue.getState().activePopupId, '1');
  queue.dismiss(); queue.dispose(); app.advance(90000); assert.equal(app.changes.at(-1), null);
  app.session.setItem(POPUP_SESSION_KEY, '{broken'); const restored = app.create(); restored.setCampaigns(campaigns); app.advance(5000); assert.equal(restored.getState().activePopupId, '1');
  const failedStorage = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); } };
  assert.doesNotThrow(() => createPopupQueue({ sessionStorage: failedStorage, localStorage: failedStorage, onChange() {} }).dispose());
});

test('a disposed view can record conversion without overwriting a newer view queue', () => {
  const app = setup(), old = app.create(); old.setCampaigns(campaigns); app.advance(5000); old.dispose();
  const current = app.create(); current.setCampaigns(campaigns); current.dismiss();
  const saved = app.session.getItem(POPUP_SESSION_KEY);
  old.complete('1');
  assert.equal(app.session.getItem(POPUP_SESSION_KEY), saved);
  assert.deepEqual(JSON.parse(app.local.getItem(POPUP_COMPLETED_KEY)), ['1']);
  app.advance(90000); assert.equal(current.getState().activePopupId, '2');
});
