export const getAvailableCartQuantity = (item, cartItems) => {
  let available;
  if (Number.isFinite(item.product?.stock)) {
    const otherQuantity = cartItems.reduce((total, other) => (
      other !== item && other.product?._id === item.product._id
        ? total + Number(other.quantity)
        : total
    ), 0);
    available = Math.max(0, item.product.stock - otherQuantity);
  }
  if (Number.isFinite(item.variant?.stock)) {
    available = Math.min(available ?? Infinity, item.variant.stock);
  }
  return available;
};

export const getStockLimitMessage = (item, available) => (
  `Only ${available} ${available === 1 ? "unit is" : "units are"} available for ${item.product.name}${item.variant ? " in the selected size/color" : ""}.`
);
