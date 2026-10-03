import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvailableCartQuantity, getStockLimitMessage } from '../src/helper/cartStock.js';

test('regular product cannot exceed its stock', () => {
  const item = { product: { _id: 'shirt', name: 'T-shirt', stock: 3 }, quantity: 3 };
  assert.equal(getAvailableCartQuantity(item, [item]), 3);
  assert.equal(getStockLimitMessage(item, 3), 'Only 3 units are available for T-shirt.');
});

test('T-shirt stock follows the selected size/color', () => {
  const item = { product: { _id: 'shirt', name: 'T-shirt', stock: 10 }, variant: { stock: 2 }, quantity: 2 };
  assert.equal(getAvailableCartQuantity(item, [item]), 2);
  assert.match(getStockLimitMessage(item, 2), /selected size\/color/);
});

test('different variants share the overall product stock', () => {
  const product = { _id: 'shirt', stock: 5 };
  const item = { product, variant: { stock: 5 }, quantity: 2 };
  const other = { product, variant: { stock: 5 }, quantity: 3 };
  const unrelated = { product: { _id: 'art' }, quantity: 20 };
  assert.equal(getAvailableCartQuantity(item, [item, other, unrelated]), 2);
});

test('zero stock and stock missing from older API responses are handled', () => {
  const item = { product: { _id: 'shirt', name: 'T-shirt', stock: 0 }, quantity: 1 };
  assert.equal(getAvailableCartQuantity(item, [item]), 0);
  assert.equal(getStockLimitMessage(item, 1), 'Only 1 unit is available for T-shirt.');
  const oldItem = { product: { _id: 'shirt' }, variant: { stock: 2 }, quantity: 1 };
  assert.equal(getAvailableCartQuantity(oldItem, [oldItem]), 2);
  assert.equal(getAvailableCartQuantity({ product: {} }, []), undefined);
});
