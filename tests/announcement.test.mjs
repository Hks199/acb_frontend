import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
const code = transformSync(readFileSync(new URL('../src/components/AnnouncementBar.jsx', import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code;
function setup(initial) {
  let response = initial, error = false, cursor = 0, effectCursor = 0, sequence = 0, signal;
  const states = [], effects = [], pending = [], timers = new Map();
  const windowEvents = new Map(), documentEvents = new Map();
  const document = { visibilityState: 'visible', addEventListener: (name, callback) => documentEvents.set(name, callback), removeEventListener: (name) => documentEvents.delete(name) };
  const window = {
    setInterval: (callback, milliseconds) => { const id = ++sequence; timers.set(id, { callback, milliseconds }); return id; },
    clearInterval: (id) => timers.delete(id),
    addEventListener: (name, callback) => windowEvents.set(name, callback), removeEventListener: (name) => windowEvents.delete(name),
  };
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, URL, AbortController, window, document,
    require: (name) => ({
      react: {
        useState: (initial) => {
          const index = cursor++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
        },
        useEffect: (callback, dependencies) => {
          const index = effectCursor++;
          const old = effects[index];
          if (!old || dependencies.some((value, n) => value !== old.dependencies[n])) {
            effects[index] = { dependencies, cleanup: old?.cleanup };
            pending.push(() => { effects[index].cleanup?.(); effects[index].cleanup = callback(); });
          }
        },
      },
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      '../utils/axiosClient': { axiosClient: { get: async (path, options) => {
        assert.equal(path, 'announcement/active'); signal = options.signal;
        if (error) throw new Error('Network failure'); return { data: response };
      } } },
    })[name],
  });
  return {
    render: () => { cursor = 0; effectCursor = 0; const tree = module.exports.default(); pending.splice(0).forEach((run) => run()); return tree; },
    unmount: () => effects.forEach((effect) => effect.cleanup?.()),
    setResponse: (next) => { response = next; }, fail: () => { error = true; },
    tick: (milliseconds) => [...timers.values()].filter((timer) => timer.milliseconds === milliseconds).forEach((timer) => timer.callback()),
    focus: () => windowEvents.get('focus')(),
    timerId: (milliseconds) => [...timers].find(([, timer]) => timer.milliseconds === milliseconds)?.[0],
    get signal() { return signal; }, get events() { return windowEvents.size + documentEvents.size; }, get timers() { return timers.size; },
  };
}
const active = { _id: '1', text: 'Free shipping!', badge: { type: 'offer', text: 'OFFER' }, isActive: true, targetUrl: 'https://example.com/products' };
const second = { ...active, _id: '2', text: 'New collection', badge: { type: 'new_launch', text: 'NEW' }, targetUrl: 'https://example.com/new' };
const settle = () => new Promise(setImmediate);
const mount = async (response) => { const app = setup(response); app.render(); await settle(); app.render(); return app; };
const current = (tree) => tree?.props.children.find((slide) => !slide.props['aria-hidden']);
const text = (tree) => current(tree)?.props.children[1].props.children;

test('filters empty/inactive data, supports old API response, maps badge styles and safe links', async () => {
  for (const response of [null, [], [{ ...active, isActive: false }], [{ ...active, text: '' }]]) {
    const app = await mount(response); assert.equal(app.render(), null); assert.equal(app.timerId(4000), undefined); app.unmount();
  }
  for (const [type, color] of [['offer', 'emerald'], ['alert', 'rose'], ['new_launch', 'blue'], ['info', 'neutral']]) {
    const app = await mount([{ ...active, badge: { ...active.badge, type } }]);
    const slide = current(app.render());
    assert.equal(slide.type, 'a'); assert.equal(slide.props.href, active.targetUrl);
    assert.ok(slide.props.className.includes(`bg-${color}-`));
    assert.equal(app.timerId(4000), undefined); app.unmount();
  }
  const legacy = await mount(active); assert.equal(text(legacy.render()), active.text); legacy.unmount();
  for (const targetUrl of ['', 'javascript:alert(1)']) {
    const app = await mount([{ ...active, targetUrl }]); assert.equal(current(app.render()).type, 'div'); app.unmount();
  }
});
test('cycles sequentially every 4 seconds, loops to first, and inactive links cannot receive focus', async () => {
  const third = { ...active, _id: '3', text: 'Third announcement' };
  const app = await mount([active, second, third, { ...active, _id: '4', isActive: false }]);
  let tree = app.render();
  assert.equal(tree.props.children.length, 3);
  assert.equal(text(tree), active.text);
  assert.equal(tree.props.children[1].props.inert, true);
  assert.equal(tree.props.children[1].props.tabIndex, -1);
  for (const expected of [second, third, active, second]) {
    app.tick(4000); tree = app.render();
    assert.equal(text(tree), expected.text);
    assert.equal(current(tree).props.href, expected.targetUrl);
    assert.equal(tree.props.children.filter((slide) => !slide.props['aria-hidden']).length, 1);
  }
  app.unmount(); assert.equal(app.timers, 0);
});
test('polling preserves rotation timer, handles shrinking/empty lists, network failures and cleanup', async () => {
  const app = await mount([active, second]);
  app.tick(4000); assert.equal(text(app.render()), second.text);
  const timer = app.timerId(4000);
  app.setResponse([active, { ...second, text: 'Updated launch' }]); app.tick(30000); await settle();
  assert.equal(text(app.render()), 'Updated launch'); assert.equal(app.timerId(4000), timer);
  app.tick(4000); assert.equal(text(app.render()), active.text);
  app.setResponse([second]); app.focus(); await settle();
  assert.equal(text(app.render()), second.text); assert.equal(app.timerId(4000), undefined);
  app.setResponse([]); app.tick(30000); await settle(); assert.equal(app.render(), null);
  app.setResponse([active, second]); app.focus(); await settle(); assert.equal(text(app.render()), active.text);
  app.fail(); app.tick(30000); await settle(); assert.equal(app.render(), null);
  app.unmount(); assert.equal(app.signal.aborted, true); assert.equal(app.events, 0); assert.equal(app.timers, 0);
});
