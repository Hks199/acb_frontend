import { notifyToaster } from '../components/notifyToaster';

export const handleBuyNowClick = (event, product) => {
  const hasStock = product?.stock !== undefined && product?.stock !== null;
  if (product?.isActive === false || (hasStock && !(Number(product.stock) > 0))) {
    event.preventDefault();
    event.stopPropagation();
    notifyToaster('Product unavailable');
  }
};
