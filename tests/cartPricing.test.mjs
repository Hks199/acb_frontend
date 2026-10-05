import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

test('cart displays quoted line prices and charges ₹999 for three eligible shirts', async () => {
  const items = [{ product: { _id: 'a', name: 'Design A' }, quantity: 2, variant: { _id: 'small', price: 499 } },
    { product: { _id: 'b', name: 'Design B' }, quantity: 1, variant: { _id: 'large', price: 499 } }];
  const pricing = { totalAmount: 1497, totalAmountAfterDiscount: 999, totalAmountToPay: 999,
    tshirtOffer: { minimumQuantity: 3, unitPrice: 333, eligibleQuantity: 3 },
    items: [{ productId: 'a', variantId: 'small', quantity: 2, effectiveUnitPrice: 333, finalTotal: 666 },
      { productId: 'b', variantId: 'large', quantity: 1, effectiveUnitPrice: 333, finalTotal: 333 }] };
  const slots = [items, 1497, 999, 498, false, pricing, false, ''];
  let cursor = 0;
  const requests = [];
  const payments = [];
  const dependencies = {
    react: { useState: (initial) => { const index = cursor++; return [slots[index] ?? initial, (value) => { slots[index] = value; }]; }, useEffect: () => {}, useRef: (initial) => ({ current: initial }) },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '../../context/UserContext': () => ({ user: { userId: 'buyer', firstName: 'Buyer', mobile_number: '123', landmark: 'Street', city: 'City', state: 'State', pin_code: '123456' } }),
    'react-router': { useNavigate: () => () => {} },
    '../../api/orders': { createOrder: async (body) => { requests.push(body); return { data: { pricing, razorpayOrder: { id: 'order', amount: 999 } } }; } },
    '../../components/notifyToaster': { notifyToaster: () => {}, notifyError: (error) => { throw new Error(error); } },
  };
  const code = transformSync(readFileSync(new URL('../src/pages/cart/Cart.jsx', import.meta.url), 'utf8'), {
    loader: 'jsx', format: 'cjs', jsx: 'automatic', define: { 'import.meta.env.VITE_RAZORPAY_KEY_ID': '"test"' },
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, require: (name) => dependencies[name] || {},
    window: { Razorpay: class { constructor(options) { this.options = options; } open() { payments.push(this.options.amount); } on() {} } },
  });
  const walk = (node) => {
    if (Array.isArray(node)) return node.flatMap(walk);
    if (!node || typeof node !== 'object') return [];
    return [node, ...walk(node.props?.children)];
  };
  const nodes = walk(module.exports.default());
  const rows = nodes.filter((node) => node.props?.priceLine);
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.equal(row.props.priceLine.effectiveUnitPrice, 333);
    const renderedRow = walk(row.type(row.props));
    assert.ok(renderedRow.some((node) => typeof node.props?.children === 'string' && node.props.children.includes('₹333 each')));
  }
  await nodes.find((node) => node.type === 'button' && node.props.children === 'Confirm Order').props.onClick();
  assert.equal(requests[0].orderedItems.reduce((sum, item) => sum + item.quantity, 0), 3);
  assert.deepEqual(payments, [99900]);
});
