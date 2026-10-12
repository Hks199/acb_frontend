const money = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number(amount) || 0);

function SummaryRow({ label, amount, discount = false, children }) {
  return <div className="py-3 border-b border-[#E5E5E5]">
    <div className="flex justify-between items-start gap-4">
      <span>{label}</span>
      <span className={`shrink-0 tabular-nums ${discount && amount > 0 ? 'text-green-700 font-semibold' : ''}`}>
        {discount && amount > 0 ? '−' : ''}{money(amount)}
      </span>
    </div>
    {children && <p className="mt-1 text-xs leading-relaxed text-gray-600">{children}</p>}
  </div>;
}

function DiscountRow({ title, detail, amount }) {
  let explanation;
  if (detail) {
    if (detail.reason === 'inactive') explanation = 'This discount is currently unavailable.';
    else if (detail.reason === 'existing_order') explanation = 'Available only on your first successful purchase. Unpaid or failed checkout attempts do not count.';
    else if (detail.reason === 'tshirt_excluded') explanation = 'T-shirts are excluded from the first-order discount.';
    else if (detail.reason === 'below_minimum') {
      explanation = `Requires ${money(detail.minimumPurchaseAmount)} or more after product offers. Your qualifying total is ${money(detail.qualifyingAmount)}; add ${money(detail.minimumPurchaseAmount - detail.qualifyingAmount)} to qualify.`;
    } else if (detail.reason === 'excluded_by_offer') {
      explanation = 'Your T-shirt offer cannot be combined with percentage discounts.';
    } else {
      explanation = `${detail.percentage}% on ${money(detail.eligibleAmount)} of eligible products after product offers.`;
      if (detail.minimumPurchaseAmount > 0) explanation += ` Qualifies at ${money(detail.minimumPurchaseAmount)} or more.`;
      if (detail.excludedAmount > 0) explanation += detail.exclusion === 'tshirt'
        ? ` ${money(detail.excludedAmount)} of T-shirts is excluded from the first-order discount.`
        : ` ${money(detail.excludedAmount)} covered by the T-shirt offer is excluded.`;
    }
  }
  return <SummaryRow label={`${title}${detail?.percentage > 0 ? ` (${detail.percentage}%)` : ''}`} amount={amount} discount>
    {explanation}
  </SummaryRow>;
}

export default function CartPricingSummary({ pricing, loading, error }) {
  if (loading) return <p role="status" className="py-4 text-gray-600">Updating your price breakdown…</p>;
  if (!pricing) return <p role="alert" className="py-4 text-red-600">{error || 'Price breakdown unavailable. Please refresh.'}</p>;

  const savings = Math.round((pricing.totalAmount - pricing.totalAmountAfterDiscount) * 100) / 100;
  return <div aria-live="polite">
    <SummaryRow label="Subtotal before discounts" amount={pricing.totalAmount} />
    <SummaryRow label="Product / T-shirt offer savings" amount={pricing.promotion_savings} discount>
      {pricing.tshirtOffer && `${pricing.tshirtOffer.minimumQuantity}+ eligible T-shirts at ${money(pricing.tshirtOffer.unitPrice)} each. Eligible quantity in your cart: ${pricing.tshirtOffer.eligibleQuantity}.${pricing.tshirtOffer.combineProducts ? '' : ' Minimum quantity applies separately to each design.'}`}
    </SummaryRow>
    <SummaryRow label="Subtotal after product offers" amount={pricing.totalAfterPromo} />
    <DiscountRow title="First-order discount" detail={pricing.discountDetails?.firstOrder} amount={pricing.first_order_discount} />
    <DiscountRow title="Order value discount" detail={pricing.discountDetails?.milestone} amount={pricing.addition_discount} />
    <SummaryRow label="Subtotal after all discounts" amount={pricing.totalAmountAfterDiscount} />
    <SummaryRow label="Tax" amount={pricing.tax} />
    <SummaryRow label="Shipping" amount={pricing.deliveryCharge} />
    <div className="flex justify-between gap-4 pt-4 font-bold text-lg">
      <span>Total to pay</span><span className="text-green-700 tabular-nums">{money(pricing.totalAmountToPay)}</span>
    </div>
    {savings > 0 && <p className="py-2 px-3 mt-3 bg-green-100 text-center text-green-800 rounded">You save {money(savings)} in total</p>}
    <p className="my-3 text-xs leading-relaxed text-gray-500">Percentage discounts use eligible prices after product offers. Discounts are rounded per unit and capped at the remaining item price.</p>
  </div>;
}
