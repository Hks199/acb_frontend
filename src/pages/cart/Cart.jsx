import { useState, useEffect, useRef } from "react";
import { MdDelete } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { calculateCartTotalAmount, clearCartApi, getCartbyId, removeCartItem, updateCartItem } from "../../api/cart";
import useUserHook from "../../context/UserContext";
import { createOrder, paymentVerificationApi } from "../../api/orders";
import { useNavigate } from "react-router";
import { notifyError, notifyToaster } from "../../components/notifyToaster";
import { getAvailableCartQuantity, getStockLimitMessage } from "../../helper/cartStock";


const Cart = () => {
  const { user, setCartCount } = useUserHook();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountedPrice, setTotalDiscountedPrice] = useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState('');
  const pricingRequest = useRef(0);
  const confirmingOrder = useRef(false);

  const getCartItems = async () => {
    try {
      const resp = await getCartbyId(user.userId);
      if (resp && resp.data && resp.data.success) {
        setCartItems(resp.data.cart.items);
        let count = 0
        resp.data.cart.items.map((obj) => {
          count = count + parseInt(obj.quantity);
        })
        setCartCount(count);
      }
      else {
        setCartItems([]);
        setCartCount(0);
      }
    }
    catch (err) {
      setCartItems([]);
      setCartCount(0);
    }
  }

  const calculateCartAmount = async () => {
    const request = ++pricingRequest.current;
    setPricingLoading(true);
    setPricingError('');
    try {
      const resp = await calculateCartTotalAmount(user.userId);
      if (request !== pricingRequest.current) return;
      if (resp && resp.data && resp.data.success) {
        const totalAmt = resp.data.totalAmountAfterDiscount;
        setPricing(resp.data);
        setOriginalPrice(resp.data.totalAmount);
        setTotalPrice(totalAmt);
        setTotalDiscountedPrice(Math.round((resp.data.totalAmount - totalAmt) * 100) / 100);
      }
      else { throw new Error('Unable to calculate cart pricing.'); }
    }
    catch (err) {
      if (request !== pricingRequest.current) return;
      setPricing(null);
      setPricingError(err.response?.data?.message || 'Unable to calculate the cart total. Please refresh.');
    }
    finally { if (request === pricingRequest.current) setPricingLoading(false); }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
    getCartItems();
    calculateCartAmount();
  }, [])

  const clearCart = async () => {
    try {
      const resp = await clearCartApi(user.userId);
      if (resp && resp.data) {
        setCartItems([]);
        setTotalPrice(0);
        setOriginalPrice(0);
        setTotalDiscountedPrice(0);
        setPricing(null);
      }
    }
    catch (err) { }
  }

  const verifyPayment = async (reqBody) => {
    try {
      const resp = await paymentVerificationApi(reqBody);
      if (resp && resp.data) {
        // console.log(resp?.data);
      }
    }
    catch (err) { }
  }

  const confirmOrder = async () => {
    if (confirmingOrder.current || btnDisable || pricingLoading || !pricing) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const userData = {
      fullName: user?.firstName || "",
      mobile: user?.mobile_number || "",
      addressLine1: user?.landmark || "",
      city: user?.city || "",
      state: user?.state || "",
      postalCode: user?.pin_code || "",
    };

    const isAnyFieldMissing = Object.values(userData).some(value => !value.trim());

    if (isAnyFieldMissing) {
      notifyToaster("Please complete your profile before proceeding.");
      return;
    }

    const itemsArr = [];
    for (let i = 0; i < cartItems.length; i++) {
      const { product, quantity, variant } = cartItems[i];
      const itemObj = {
        product_id: product._id,
        quantity: quantity,
      }

      if (variant && variant._id) {
        itemObj["variant_combination_id"] = variant?._id
      }

      itemsArr.push(itemObj);

    }


    const reqBody = {
      user_id: user.userId,
      orderedItems: itemsArr,
      shippingAddress: {
        fullName: user.firstName,
        mobile: user.mobile_number,
        addressLine1: user.landmark,
        city: user.city,
        state: user.state,
        postalCode: user.pin_code,
        country: "India"
      },
      paymentMethod: "UPI",
      subtotal: totalPrice,
      tax: 0,
      deliveryCharge: 0
    }
    // console.log("reqBody", reqBody);
    confirmingOrder.current = true;
    try {
      const resp = await createOrder(reqBody);
      if (resp && resp.data) {
        // console.log("resp.data -> ", resp.data);
        if (resp.data.pricing && resp.data.pricing.totalAmountToPay !== totalPrice) {
          await calculateCartAmount();
          notifyToaster('The price has changed. Review the updated total and confirm again.');
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(Number(resp.data.razorpayOrder.amount) * 100),
          // currency: data.currency,
          currency: "INR",
          name: "Art & Craft From Bharat",
          description: "Transaction",
          order_id: resp.data.razorpayOrder.id,
          handler: function (response) {
            // alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            // console.log(`Payment successful! Payment ID: ${response.razorpay_payment_id}`)
            // console.log("Razorpay resp:", response)
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
            verifyPayment(verifyPayload);
            notifyToaster("Order confirmed. Thank you for your purchase!");
            clearCart();
            navigate("/orders");
          },
          // prefill: {
          //   name: "John Doe",
          //   email: "john@example.com",
          //   contact: "9999999999",
          // },
          theme: {
            color: "#FF5E5E",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', (errResp) => {
          notifyToaster("Payment failed: " + errResp?.error?.description);
        })
      }
    }
    catch (err) {
      if (err?.response?.data?.message === "400" || err?.response?.data?.errorType === "OutOfStock") {
        notifyToaster("Product unavailable");
      } else {
        notifyError(err?.response?.data?.message);
      }
    }
    finally { confirmingOrder.current = false; }
  }



  return (
    <div className="px-4 py-6 md:p-10 md:px-20 min-h-[85vh]">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
      <div className="flex flex-col lg:flex-row items-start gap-12">
        <div className="w-full md:flex-1">
          {cartItems.map((item, index) => (
            <ListItem key={`${item.product._id}-${item.variant?._id || "default"}`} item={item} index={index} setBtnDisable={setBtnDisable} cartItems={cartItems} setCartItems={setCartItems} getCartItems={getCartItems} calculateCartAmount={calculateCartAmount} setCartCount={setCartCount}
              priceLine={pricing?.items?.find((line) => String(line.productId) === String(item.product._id) && String(line.variantId || '') === String(item.variant?._id || ''))} updatingPrice={btnDisable || pricingLoading} />
          ))}
        </div>

        <div className="w-full max-w-sm bg-[#FAFAFA] p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          {pricingError && <p role="alert" className="text-red-600">{pricingError}</p>}
          {pricing?.tshirtOffer && <p className="mb-3 text-green-700">{pricing.tshirtOffer.minimumQuantity}+ eligible T-shirts: ₹{pricing.tshirtOffer.unitPrice} each. Eligible quantity: {pricing.tshirtOffer.eligibleQuantity}.</p>}
          <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
            <span>Subtotal</span>
            <span>{btnDisable || pricingLoading ? "..." : "₹" + originalPrice}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
            <span>Tax</span>
            <span>{btnDisable ? "..." : "₹0"}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
            <span>Shipping</span>
            <span>{btnDisable ? "..." : "₹0"}</span>
          </div>
          <div className="flex justify-between pt-4 font-semibold text-lg">
            <span>Total</span>
            <span className="text-[#69D3A8]">{btnDisable || pricingLoading ? "..." : pricing ? "₹" + totalPrice : 'Unavailable'}</span>
          </div>
          {totalDiscountedPrice !== 0 && (
            <div className="py-1.5 px-4 mt-3 mb-4 w-full bg-green-100 text-center text-[#69D3A8] text- rounded">{btnDisable || pricingLoading ? 'Updating savings…' : `You save ₹${totalDiscountedPrice}.`}</div>
          )}
          {cartItems.length > 0 && (
            <button disabled={btnDisable || pricingLoading || !pricing} onClick={confirmOrder} className={`w-full ${btnDisable || pricingLoading || !pricing ? "bg-[#cccccc]" : "bg-[#F75E69]"} text-white py-2 rounded-md mb-3`}>
              {btnDisable ? "..." : "Confirm Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


const ListItem = ({ item, index, setBtnDisable, cartItems, setCartItems, getCartItems, calculateCartAmount, setCartCount, priceLine, updatingPrice }) => {
  const { user } = useUserHook();
  const debounceTimer = useRef(null);

  const updateCartQuantity = async (qty) => {
    const reqBody = {
      user_id: user.userId,
      product_id: item.product._id,
      quantity: qty
    }

    if (item.variant) reqBody["variant_id"] = item.variant._id;

    try {
      const resp = await updateCartItem(reqBody);
      if (resp && resp.data && resp.data.success) {
        await calculateCartAmount();
      }
    }
    catch (err) {
      if (err?.response?.data?.errorType === "OutOfStock") {
        notifyToaster(err.response.data.message);
      } else {
        notifyError();
      }
      // Restore the saved quantity and totals when the server rejects an update.
      await getCartItems();
      await calculateCartAmount();
    }
    finally {
      setBtnDisable(false);
    }
  }

  const handleQuantity = (flag) => {
    if (updatingPrice) return;
    const qty = flag ? item.quantity + 1 : (item.quantity > 1 ? item.quantity - 1 : 1);
    const available = getAvailableCartQuantity(item, cartItems);
    if (flag && available !== undefined && qty > available) {
      notifyToaster(getStockLimitMessage(item, available));
      return;
    }
    if (qty === item.quantity) return;
    const newArr = [...cartItems];
    const newObj = { ...item, quantity: qty }
    newArr[index] = newObj;
    setCartItems(newArr);
    let count = 0
    newArr.map((obj) => {
      count = count + parseInt(obj.quantity);
    })
    setCartCount(count);
    setBtnDisable(true);

    // Debounce the API call
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateCartQuantity(qty);
    }, 300);
  }

  const deleteCartItems = async () => {
    // console.log(user, user.userId)
    const reqBody = {
      user_id: user.userId,
      product_id: item.product._id,
    }

    if (item.variant) reqBody["variant_id"] = item.variant._id;

    try {
      const resp = await removeCartItem(reqBody);
      if (resp && resp.data && resp.data.success) {
        await getCartItems();
        await calculateCartAmount();
      }
    }
    catch (err) { }
  }


  return (
    <div key={index} className="py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-[#E4E4E7]">
      <div className="flex items-center gap-4">
        <img src={item.product.image} className="w-16 h-16 object-cover rounded-lg" />
        <div>
          <h4 className="font-semibold text-sm">{item.product.name}</h4>
          <p className="text-[#F75E69]">{updatingPrice ? 'Updating price…' : priceLine ? `₹${priceLine.effectiveUnitPrice} each · ₹${priceLine.finalTotal} total` : 'Price unavailable'}</p>
          {priceLine?.bulkOfferApplied && <p className="text-sm text-green-700">T-shirt offer applied</p>}
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex self-end items-center gap-4">
        <div className="flex border rounded-md">
          <button disabled={updatingPrice} onClick={() => handleQuantity(false)} className="px-4 py-2 text-white bg-black rounded-l-md"><FaMinus /></button>
          <div className="px-4 font-semibold text-lg">{item.quantity}</div>
          <button disabled={updatingPrice} onClick={() => handleQuantity(true)} className="px-4 py-2 text-white bg-black rounded-r-md"><FaPlus /></button>
        </div>

        <button disabled={updatingPrice} onClick={deleteCartItems} className="text-2xl hover:text-[#F75E69]"><MdDelete /></button>
      </div>
    </div>
  )
}

export default Cart
