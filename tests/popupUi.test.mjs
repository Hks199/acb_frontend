import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
const walk = (node) => Array.isArray(node) ? node.flatMap(walk) : !node || typeof node !== 'object' ? [] : [node, ...walk(node.props?.children)];
function harness(file, dependencies, globals = {}) {
  const states = [], effects = []; let cursor = 0, first = true;
  const react = { useCallback: (callback) => callback, useRef: (value) => {
    const index = cursor++; if (!(index in states)) states[index] = { current: value }; return states[index];
  }, useState: (value) => {
    const index = cursor++; if (!(index in states)) states[index] = value;
    return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
  }, useEffect: (effect) => { if (first) effects.push(effect); } };
  const module = { exports: {} };
  vm.runInNewContext(transformSync(readFileSync(new URL(file, import.meta.url), 'utf8'), { loader: 'jsx', format: 'cjs', jsx: 'automatic' }).code, {
    module, exports: module.exports, require: (name) => ({ react, 'react/jsx-runtime': jsx, ...dependencies })[name] || name, URL, AbortController, ...globals,
  });
  return { effects, render: (props) => { cursor = 0; const tree = walk(module.exports.default(props)); first = false; return tree; } };
}
const campaign = { _id: '1', title: 'Join us', subtitle: 'New crafts', displayType: 'newsletter_signup', backgroundTheme: 'glass_dark', couponCode: 'FIRST10', ctaText: 'Join now', ctaUrl: '/products', isActive: true };
test('coupon copies to clipboard and shows Copied; newsletter submits trimmed email and keeps failures visible', async () => {
  const copied = [], submitted = [];
  const app = harness('../src/components/promotions/CampaignCard.jsx', {
    '@mui/material': { Alert: 'Alert', Button: 'Button', TextField: 'TextField' },
    'react-icons/fi': Object.fromEntries(['FiArrowUpRight', 'FiCheck', 'FiCopy', 'FiX'].map((key) => [key, key])),
  }, { navigator: { clipboard: { writeText: async (value) => copied.push(value) } }, window: {} });
  const props = { campaign, onAction: async (email) => { submitted.push(email); throw new Error('Signup unavailable'); } };
  let tree = app.render(props);
  await tree.find((node) => node.props?.className?.startsWith('promo-coupon')).props.onClick();
  tree = app.render(props); assert.equal(copied[0], 'FIRST10');
  assert.ok(tree.find((node) => node.props?.className?.includes('is-copied')));
  assert.ok(tree.find((node) => node.type === 'FiCheck'));
  tree.find((node) => node.type === 'TextField').props.onChange({ target: { value: ' test@example.com ' } });
  tree = app.render(props); await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(submitted[0], 'test@example.com');
  assert.equal(app.render(props).find((node) => node.type === 'Alert').props.children, 'Signup unavailable');
});
test('successful signup marks conversion and redirects; failed or late signups cannot advance the wrong popup', async () => {
  for (const mode of ['success', 'failure', 'late']) {
    let activeId = '1', resolvePost;
    const completed = [], navigations = [];
    const manager = { setCampaigns() {}, dispose() {}, dismiss() { activeId = null; }, getState: () => ({ activePopupId: activeId }), complete: (id) => { completed.push(id); if (activeId === id) activeId = null; } };
    let onChange;
    const app = harness('../src/components/promotions/PromotionalPopups.jsx', {
      '@mui/material': { Dialog: 'Dialog', Grow: 'Grow' }, 'react-router': { useNavigate: () => (path) => navigations.push(path) },
      '../../helper/popupQueue': { createPopupQueue: (options) => { onChange = options.onChange; return manager; } },
      '../../utils/axiosClient': { axiosClient: { get: async () => ({ data: [campaign] }), post: async () => {
        if (mode === 'failure') throw new Error('Signup failed');
        if (mode === 'late') return new Promise((resolve) => { resolvePost = resolve; });
        return { data: { success: true } };
      } } },
    }, { window: { setInterval() {}, clearInterval() {}, addEventListener() {}, removeEventListener() {}, location: { assign: (path) => navigations.push(path) } } });
    app.render(); app.effects.forEach((effect) => effect()); onChange(campaign);
    const card = app.render().find((node) => node.type === './CampaignCard');
    if (mode === 'failure') { await assert.rejects(card.props.onAction('test@example.com')); assert.equal(completed.length, 0); assert.equal(activeId, '1'); }
    else {
      const action = card.props.onAction('test@example.com');
      if (mode === 'late') { activeId = '2'; resolvePost({ data: { success: true } }); }
      await action; assert.equal(completed[0], '1');
      assert.equal(navigations.length, mode === 'late' ? 0 : 1);
      assert.equal(activeId, mode === 'late' ? '2' : null);
    }
  }
});
