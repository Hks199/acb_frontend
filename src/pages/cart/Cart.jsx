import { useState, useEffect, useRef } from "react";
import { MdDelete } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { calculateCartTotalAmount, clearCartApi, getCartbyId, removeCartItem, updateCartItem } from "../../api/cart";
import useUserHook from "../../context/UserContext";
import { createOrder, paymentVerificationApi } from "../../api/orders";
import { useNavigate } from "react-router";
import { notifyError, notifyToaster } from "../../components/notifyToaster";


const Cart = () => {
  const { user, setCartCount } = useUserHook();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [btnDisable, setBtnDisable] = useState(false);

  const getCartItems = async() => {
    try{
      const resp = await getCartbyId(user.userId);
      if(resp && resp.data && resp.data.success){
        setCartItems(resp.data.cart.items);
        let count = 0
        resp.data.cart.items.map((obj) => {
          count = count + parseInt(obj.quantity);
        })
        setCartCount(count);
      }
      else{
        setCartItems([]);
        setCartCount(0);
      }
    }
    catch(err){
      setCartItems([]);
      setCartCount(0);
    }
  }

  const calculateCartAmount = async() => {
    try{
      const resp = await calculateCartTotalAmount(user.userId);
      if(resp && resp.data && resp.data.success){
        setTotalPrice(resp.data.totalAmount);
      }
    }
    catch(err){}
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
    getCartItems();
    calculateCartAmount();
  }, [])

  const clearCart = async() => {
    try{
      const resp = await clearCartApi(user.userId);
      if(resp && resp.data){
        setCartItems([]);
        setTotalPrice(0);
      }
    }
    catch(err){}
  }

  const verifyPayment = async(reqBody) => {
    try{
      const resp = await paymentVerificationApi(reqBody);
      if(resp && resp.data){
        // console.log(resp?.data);
      }
    }
    catch(err){}
  }

  const confirmOrder = async() => {
    if(!user){
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
    for(let i = 0; i < cartItems.length; i++){
      const {product, quantity, variant, fallback_price} = cartItems[i];
      const itemObj = {
        product_id: product._id,
        quantity: quantity,
        price_per_unit: variant ? variant.price : fallback_price,
        total_price: (variant ? variant.price : fallback_price) * quantity
      }

      if(variant && variant._id){
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
    try{
      const resp = await createOrder(reqBody);
      if(resp && resp.data){
        // console.log("resp.data -> ", resp.data);

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Number(resp.data.razorpayOrder.amount) * 100,
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
    catch(err){
      if(err?.response?.data?.message  === "400"){
        const str = err?.response?.data?.errorType;
        const matches = str.match(/[a-zA-Z0-9]+/g);
        const lastSequence = matches ? matches[matches.length - 1] : null;
        const prdName = cartItems.find((obj) => obj?.product?._id === lastSequence)?.product.name;
        if(prdName){
          notifyToaster(prdName + " is out of stock");
        }
        else{
          notifyError();
        }
      }
      else if(err?.response?.data?.errorType === "OutOfStock"){
        const str = err?.response?.data?.message;
        const matches = str.match(/[a-zA-Z0-9]+/g);
        const lastSequence = matches ? matches[matches.length - 1] : null;
        const prdName = cartItems.find((obj) => obj?.variant?._id === lastSequence ? obj : null);
        if(prdName?.product?.name){
          notifyToaster(`We’re sorry — the selected variant of ${prdName?.product?.name} is unavailable!`);
        }
        else{
          notifyError();
        }
      }
      else{
        notifyError();
      }
    }
  }


  return (
    <div className="px-4 py-6 md:p-10 md:px-20 min-h-[85vh]">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
      <div className="flex flex-col lg:flex-row items-start gap-12">
        <div className="w-full md:flex-1">
            {cartItems.map((item, index) => (
              <ListItem item={item} index={index} setBtnDisable={setBtnDisable} cartItems={cartItems} setCartItems={setCartItems} getCartItems={getCartItems} calculateCartAmount={calculateCartAmount} setCartCount={setCartCount} />
            ))}
        </div>

        <div className="w-full max-w-sm bg-[#FAFAFA] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
                <span>Subtotal</span>
                <span>{btnDisable ? "..." : "₹" + totalPrice}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
                <span>Tax</span>
                <span>{btnDisable ? "..." : "₹0"}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#E5E5E5]">
                <span>Shipping</span>
                <span>{btnDisable ? "..." : "₹0"}</span>
            </div>
            <div className="flex justify-between py-4 font-semibold text-lg">
                <span>Total</span>
                <span className="text-[#69D3A8]">{btnDisable ? "..." : "₹" + totalPrice}</span>
            </div>
            {cartItems.length > 0 && (
              <button disabled={btnDisable} onClick={confirmOrder} className={`w-full ${btnDisable ? "bg-[#cccccc]" : "bg-[#F75E69]"} bg-[#F75E69] text-white py-2 rounded-md mb-3`}>
                {btnDisable ? "..." : "Confirm Order"}
              </button>
            )}
        </div>
      </div>
    </div>
  )
}


const ListItem = ({ item, index, setBtnDisable, cartItems, setCartItems, getCartItems, calculateCartAmount, setCartCount }) => {
  const { user } = useUserHook();
  const debounceTimer = useRef(null);

  const updateCartQuantity = async(qty) => {
    const reqBody = {
      user_id: user.userId,
      product_id: item.product._id,
      quantity: qty
    }

    if(item.variant) reqBody["variant_id"] = item.variant._id;

    try{
      const resp = await updateCartItem(reqBody);
      if(resp && resp.data && resp.data.success){
        calculateCartAmount();
      }
    }
    catch(err){}
    finally{
      setBtnDisable(false);
    }
  }

  const handleQuantity = (flag) => {
    const qty = flag ? item.quantity + 1 : (item.quantity > 1 ? item.quantity - 1 : 1);
    const newArr = [...cartItems];
    const newObj = {...item, quantity: qty}
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
    }, 1500); // adjust delay as needed
  }

  const deleteCartItems = async() => {
    // console.log(user, user.userId)
    const reqBody = {
      user_id: user.userId,
      product_id: item.product._id,
    }

    if(item.variant) reqBody["variant_id"] = item.variant._id;

    try{
      const resp = await removeCartItem(reqBody);
      if(resp && resp.data && resp.data.success){
        getCartItems();
        calculateCartAmount();
      }
    }
    catch(err){}
  }


  return(
    <div key={index} className="py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-[#E4E4E7]">
      <div className="flex items-center gap-4">
          <img src={item.product.image} className="w-16 h-16 object-cover rounded-lg"/>
          <div>
              <h4 className="font-semibold text-sm">{item.product.name}</h4>
              <p className="text-[#F75E69]">₹{item.variant ? item.variant.price : item.fallback_price}</p>
          </div>
      </div>

      <div className="mt-4 md:mt-0 flex self-end items-center gap-4">
          <div className="flex border rounded-md">
              <button onClick={() => handleQuantity(false)} className="px-4 py-2 text-white bg-black rounded-l-md"><FaMinus /></button>
              <div className="px-4 font-semibold text-lg">{item.quantity}</div>
              <button onClick={() => handleQuantity(true)} className="px-4 py-2 text-white bg-black rounded-r-md"><FaPlus /></button>
          </div>

          <button onClick={deleteCartItems} className="text-2xl hover:text-[#F75E69]"><MdDelete /></button>
      </div>
    </div>
  )
}

export default Cart