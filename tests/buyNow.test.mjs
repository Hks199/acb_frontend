import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const compile = (file) => transformSync(readFileSync(new URL(file, import.meta.url), 'utf8'), {
  loader: 'jsx', format: 'cjs', jsx: 'automatic',
  define: { 'import.meta.env.VITE_RAZORPAY_KEY_ID': '"test"' },
}).code;

const walk = (node) => {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children)];
};

const setup = (file, product, stateOverrides, user = null) => {
  const messages = [];
  const requests = [];
  let paymentOpens = 0;
  const toaster = { notifyToaster: (message) => messages.push(message), notifyError: () => messages.push('error') };
  const helperModule = { exports: {} };
  vm.runInNewContext(compile('../src/helper/buyNow.js'), {
    module: helperModule, exports: helperModule.exports, require: () => toaster,
  });
  let stateIndex = 0;
  const slots = [];
  const dependencies = {
    react: {
      useState: (initial) => {
        const index = stateIndex++;
        if (!(index in slots)) slots[index] = Object.hasOwn(stateOverrides, index) ? stateOverrides[index] : initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
      useEffect: () => {}, useRef: (initial) => ({ current: initial }),
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' },
    'react-router': { Link: 'a', useNavigate: () => () => {}, useParams: () => ({ id: product._id }), useLocation: () => ({}) },
    '../../context/UserContext': () => ({ user, setCartCount: () => {} }),
    '../../api/orders': { createOrder: async (body) => {
      requests.push(body);
      return { data: { razorpayOrder: { id: 'order', amount: 499 } } };
    } },
    '../components/notifyToaster': toaster,
    '../../components/notifyToaster': toaster,
    '../helper/buyNow': helperModule.exports,
    '../../helper/buyNow': helperModule.exports,
  };
  const module = { exports: {} };
  vm.runInNewContext(compile(file), {
    module, exports: module.exports, require: (name) => dependencies[name] || (() => {}),
    window: { Razorpay: class { open() { paymentOpens++; } on() {} } },
  });
  const render = () => { stateIndex = 0; return walk(module.exports.default()); };
  return {
    get controls() { return render().filter((node) => node.props?.children === 'Buy Now'); },
    render, messages, requests, get paymentOpens() { return paymentOpens; },
  };
};

const pages = [
  ['homepage', '../src/pages/Homepage.jsx', (product) => ({ 1: [product] })],
  ['product listing', '../src/pages/products/AllProducts.jsx', (product) => ({ 2: [product], 5: false })],
  ['gallery', '../src/pages/gallery/VendorList.jsx', (product) => ({ 1: [{ imageUrls: [], products: [product] }] })],
  ['related products', '../src/pages/products/ProductDetails.jsx', (product) => ({ 0: false, 7: product, 8: [product] })],
];

for (const [name, file, states] of pages) {
  for (const stock of [0, '0', 3]) {
    test(`${name}: Buy Now ${Number(stock) === 0 ? 'blocks unavailable product' : 'allows stocked product navigation'} (${stock})`, () => {
      const product = { _id: 'craft', product_name: 'Craft', imageUrls: [], stock, isActive: true };
      const { controls, messages } = setup(file, product, states(product));
      const cardControl = controls.find((node) => node.type === 'div');
      assert.ok(cardControl, 'Buy Now must be rendered on the product card');
      let prevented = false;
      let stopped = false;
      cardControl.props.onClick({ preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
      assert.equal(prevented, Number(stock) === 0);
      assert.equal(stopped, Number(stock) === 0);
      assert.deepEqual(messages, Number(stock) === 0 ? ['Product unavailable'] : []);
    });
  }
}

test('product detail Buy Now blocks checkout before redirecting a logged-out shopper', async () => {
  const product = { _id: 'craft', product_name: 'Craft', imageUrls: [], stock: 0, isActive: true };
  const { controls, messages } = setup('../src/pages/products/ProductDetails.jsx', product, { 0: false, 7: product });
  await controls.find((node) => node.type === 'button').props.onClick();
  assert.deepEqual(messages, ['Product unavailable']);
});

test('product detail Buy Now checks the selected variant stock', async () => {
  const product = { _id: 'craft', product_name: 'Craft', imageUrls: [], stock: 10, isActive: true };
  const { controls, messages } = setup('../src/pages/products/ProductDetails.jsx', product, {
    0: false, 1: 'L', 2: '#000000', 5: 'sold-out-size', 7: product, 10: true,
    13: [{ _id: 'sold-out-size', Size: 'L', Color: '#000000', stock: 0 }],
  });
  await controls.find((node) => node.type === 'button').props.onClick();
  assert.deepEqual(messages, ['Product unavailable']);
});

const shopper = { userId: 'customer', firstName: 'Buyer', mobile_number: '123', landmark: 'Street', city: 'City', state: 'State', pin_code: '123456' };

for (const variantStock of [undefined, 0, -1]) {
  test(`selecting an unavailable T-shirt size never purchases the previously selected size (${variantStock})`, async () => {
    const product = { _id: 'shirt', product_name: 'T-shirt', price: 499, imageUrls: [], stock: 10, isActive: true };
    const combinations = [{ _id: 'small', Size: 'S', Color: '#000000', stock: 2, price: 499 }];
    if (variantStock !== undefined) combinations.push({ _id: 'large', Size: 'L', Color: '#000000', stock: variantStock, price: 499 });
    const app = setup('../src/pages/products/ProductDetails.jsx', product, {
      0: false, 1: 'S', 2: '#000000', 3: 499, 5: 'small', 7: product, 10: true,
      11: ['S', 'L'], 12: ['#000000'], 13: combinations,
    }, shopper);
    app.render().find((node) => node.type === 'button' && node.props.children === 'L').props.onClick();
    await app.controls.find((node) => node.type === 'button').props.onClick();
    assert.deepEqual(app.messages, ['Product unavailable']);
    assert.equal(app.requests.length, 0);
    assert.equal(app.paymentOpens, 0);
  });
}

test('an in-stock selected T-shirt size still opens checkout with its own variant ID', async () => {
  const product = { _id: 'shirt', product_name: 'T-shirt', price: 499, imageUrls: [], stock: 10, isActive: true };
  const app = setup('../src/pages/products/ProductDetails.jsx', product, {
    0: false, 1: 'S', 2: '#000000', 3: 499, 5: 'small', 7: product, 10: true,
    13: [{ _id: 'small', Size: 'S', Color: '#000000', stock: 2, price: 499 }],
  }, shopper);
  await app.controls.find((node) => node.type === 'button').props.onClick();
  assert.equal(app.requests[0].orderedItems[0].variant_combination_id, 'small');
  assert.equal(app.paymentOpens, 1);
  assert.deepEqual(app.messages, []);
});
