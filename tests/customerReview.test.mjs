import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const code = transformSync(readFileSync(new URL('../src/pages/orders/CustomerOrder.jsx', import.meta.url), 'utf8'), {
  loader: 'jsx', format: 'cjs', jsx: 'automatic',
}).code;
const orders = [
  { product_id: 'productA', product_name: 'Product A', orderStatus: 'Delivered' },
  { product_id: 'productB', product_name: 'Product B', orderStatus: 'Delivered' },
];

// Exercise the actual component handlers without connecting to the hosted API.
const setup = (createReview = async () => ({ data: { success: true } })) => {
  const slots = [];
  const requests = [];
  const messages = [];
  let cursor = 0;
  const Rating = () => {};
  const Dialog = () => {};
  const hooks = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = index === 0 ? orders : initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect: () => {},
  };
  const dependencies = {
    react: hooks,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' },
    '../../context/UserContext': () => ({ user: { userId: 'customer' } }),
    '../../api/ratings': { createReview: (payload) => { requests.push(payload); return createReview(payload); } },
    '../../components/notifyToaster': { notifyToaster: (message) => messages.push(message), notifyError: () => messages.push('error') },
    '@mui/material/Rating': Rating,
    '@mui/material/Dialog': Dialog,
  };
  const module = { exports: {} };
  vm.runInNewContext(code, { module, require: (name) => dependencies[name] || (() => {}), exports: module.exports });
  const walk = (node) => {
    if (Array.isArray(node)) return node.flatMap(walk);
    if (!node || typeof node !== 'object') return [];
    return [node, ...walk(node.props?.children)];
  };
  const render = () => { cursor = 0; return module.exports.default(); };
  const reviewButtons = (tree) => walk(tree).filter(node => node.type === 'button' && node.props.children === 'Add a Review');
  const dialog = (tree) => walk(tree).find(node => node.type === Dialog && walk(node).some(child => child.type === Rating));
  const controls = () => {
    const tree = render();
    const reviewDialog = dialog(tree);
    return {
      buttons: reviewButtons(tree), dialog: reviewDialog,
      rating: walk(reviewDialog).find(node => node.type === Rating),
      text: walk(reviewDialog).find(node => node.type === 'textarea'),
      submit: walk(reviewDialog).find(node => node.type === 'button'),
    };
  };
  return { controls, requests, messages };
};

test('opening a different product clears the previous rating/text and sends its own ID', async () => {
  const { controls, requests } = setup();
  controls().buttons[0].props.onClick();
  controls().rating.props.onChange(null, 5);
  controls().text.props.onChange({ target: { value: 'Draft for A' } });
  controls().dialog.props.onClose();
  controls().buttons[1].props.onClick();
  assert.equal(controls().rating.props.value, 0);
  assert.equal(controls().text.props.value, '');
  controls().rating.props.onChange(null, 2);
  controls().text.props.onChange({ target: { value: 'Review for B' } });
  await controls().submit.props.onClick();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].productId, 'productB');
  assert.equal(requests[0].rating, 2);
  assert.equal(requests[0].review, 'Review for B');
  assert.equal(controls().dialog.props.open, false);
});

test('submitting without a selected star rating does not call the API', async () => {
  const { controls, requests, messages } = setup();
  controls().buttons[0].props.onClick();
  await controls().submit.props.onClick();
  assert.equal(requests.length, 0);
  assert.match(messages[0], /select a rating/);
});

test('an in-flight review cannot be submitted twice or switched to another product', async () => {
  let finish;
  const { controls, requests } = setup(() => new Promise(resolve => { finish = resolve; }));
  controls().buttons[0].props.onClick();
  controls().rating.props.onChange(null, 4);
  const pending = controls().submit.props.onClick();
  assert.equal(controls().submit.props.disabled, true);
  await controls().submit.props.onClick();
  controls().dialog.props.onClose();
  controls().buttons[1].props.onClick();
  assert.equal(controls().dialog.props.open, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].productId, 'productA');
  finish({ data: { success: true } });
  await pending;
  assert.equal(controls().submit.props.disabled, false);
  controls().buttons[1].props.onClick();
  assert.equal(controls().rating.props.value, 0);
});

test('a network error keeps the selected product and permits retry', async () => {
  const { controls, messages } = setup(async () => { throw new Error('offline'); });
  controls().buttons[1].props.onClick();
  controls().rating.props.onChange(null, 3);
  await controls().submit.props.onClick();
  assert.equal(messages[0], 'error');
  assert.equal(controls().dialog.props.open, true);
  assert.equal(controls().rating.props.value, 3);
  assert.equal(controls().submit.props.disabled, false);
});
