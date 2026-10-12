export const getCartVariantId = (item) => item.variant?._id || item.variant_id || null;

export const findCartPriceLine = (lines, item) => lines?.find((line) => (
  String(line.productId) === String(item.product._id)
  && String(line.variantId || '') === String(getCartVariantId(item) || '')
));
