import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
const code = transformSync(readFileSync(new URL('../src/components/AnnouncementBar.jsx', import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code;
function setup(initial) {
  let value = initial, response = initial, error = false, effect, cleanup, timer;
  const windowEvents = new Map(), documentEvents = new Map();
  const document = { visibilityState: 'visible', addEventListener: (name, callback) => documentEvents.set(name, callback), removeEventListener: (name) => documentEvents.delete(name) };
  const window = {
    setInterval: (callback, milliseconds) => { timer = callback; assert.equal(milliseconds, 30000); return 1; },
    clearInterval: () => { timer = null; },
    addEventListener: (name, callback) => windowEvents.set(name, callback), removeEventListener: (name) => windowEvents.delete(name),
  };
  let signal;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, URL, AbortController, window, document,
    require: (name) => ({
      react: { useState: () => [value, (next) => { value = next; }], useEffect: (callback) => { effect = callback; } },
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      '../utils/axiosClient': { axiosClient: { get: async (path, options) => {
        assert.equal(path, 'announcement/active'); signal = options.signal;
        if (error) throw new Error('Network failure'); return { data: response };
      } } },
    })[name],
  });
  return { render: () => module.exports.default(), mount: () => { cleanup = effect(); }, unmount: () => cleanup(),
    setResponse: (next) => { response = next; }, fail: () => { error = true; },
    refresh: () => timer(), focus: () => windowEvents.get('focus')(),
    get signal() { return signal; }, get events() { return windowEvents.size + documentEvents.size; },
  };
}
const active = { text: 'Free shipping!', badge: { type: 'offer', text: 'OFFER' }, isActive: true, targetUrl: 'https://example.com/products' };
const settle = () => new Promise(setImmediate);
test('bar is hidden for null/inactive data, maps all styles, and makes the whole bar a safe link', () => {
  assert.equal(setup(null).render(), null);
  assert.equal(setup({ ...active, isActive: false }).render(), null);
  for (const [type, color] of [['offer', 'emerald'], ['alert', 'rose'], ['new_launch', 'blue'], ['info', 'neutral']]) {
    const tree = setup({ ...active, badge: { ...active.badge, type } }).render();
    assert.equal(tree.type, 'a'); assert.equal(tree.props.href, active.targetUrl);
    assert.ok(tree.props.className.includes(`bg-${color}-`));
    assert.equal(tree.props.children[1].props.children, active.text);
  }
  assert.equal(setup({ ...active, targetUrl: '' }).render().type, 'div');
  assert.equal(setup({ ...active, targetUrl: 'javascript:alert(1)' }).render().type, 'div');
});
test('public updates, deactivation, failed refresh and unmount are handled without stale visibility', async () => {
  const app = setup(null);
  app.render(); app.setResponse(active); app.mount(); await settle();
  assert.equal(app.render().props.children[1].props.children, active.text);
  app.setResponse({ ...active, text: 'New collection!' }); app.focus(); await settle();
  assert.equal(app.render().props.children[1].props.children, 'New collection!');
  app.setResponse(null); app.refresh(); await settle(); assert.equal(app.render(), null);
  app.setResponse(active); app.refresh(); await settle(); assert.ok(app.render());
  app.fail(); app.refresh(); await settle(); assert.equal(app.render(), null);
  app.unmount(); assert.equal(app.signal.aborted, true); assert.equal(app.events, 0);
});
