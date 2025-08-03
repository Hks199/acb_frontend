import { useState, useEffect } from 'react';
import { FaAngleRight } from "react-icons/fa6";
import { IoIosStar } from "react-icons/io";
import { IoEarthOutline, IoPersonOutline, IoPersonCircleSharp  } from "react-icons/io5";
import { MdOutlinePayment } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import Rating from '@mui/material/Rating';
import { Link, useParams, useNavigate } from 'react-router';
import { getCategoryById, getProductDetails, getProductsByCategory } from '../../api/products';
import { getReviewsByProductId } from '../../api/ratings';
import useUserHook from '../../context/UserContext';
import { addToCart } from '../../api/cart';
import ImageMagnifier from './ImageMagnifier';
import parse from 'html-react-parser';
import Pagination from '@mui/material/Pagination';
import { createOrder, paymentVerificationApi } from '../../api/orders';
import { notifyError, notifyToaster } from '../../components/notifyToaster';


const ProductDetails = () => {
    const { id } = useParams();
    const { user } = useUserHook();
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [price, setPrice] = useState("");
    const [currentVarientId, setCurrentVarientId] = useState(null);
    const [showDesc, setShowDesc] = useState(true);
    const [productDetail, setProductDetail] = useState(null);
    const [productList, setProductList] = useState([]);
    const [category, setCategory] = useState("");
    const [isVarient, setIsVarient] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [combinations, setCombinations] = useState([]);
    const [ratings, setRatings] = useState({ rating: 0, review: 0, ratingsArr: [] });
    const [productImgs, setProductImgs] = useState([]);
    const [productImgObj, setProductImgObj] = useState(null);
    const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });


    const fetchRatings = async(id, pageNum) => {
        const reqBody = { page : pageNum, limit : 10 }
        try{
            const resp = await getReviewsByProductId(id, reqBody);
            if(resp && resp.data && resp.data.success){
                setRatings((prev) => ({...prev, ratingsArr: resp.data.reviews, review: resp.data.totalReviews}))
                setPages({ totalPages: resp.data.totalPages, currentPage: resp.data.currentPage });
            }
            else{
                setRatings({ rating: 0, review: 0, ratingsArr: [] });
            }
        } catch (err) {
            setRatings({ rating: 0, review: 0, ratingsArr: [] });
        }
    }

    const fetchProductDetails = async(productId) => {
        try{
            const response = await getProductDetails(productId);
            if(response && response.data && response.data.success){
                setProductDetail(response.data.product);
                setPrice(response.data.product.price);
                if(response.data?.variant?.varient_name?.length > 0){
                    setIsVarient(true);
                    setSizes(response.data?.variant?.Size);
                    setColors(response.data?.variant?.Color);
                    setCombinations(response.data?.variant?.combinations);
                    const { Size, Color, price, _id } = response.data?.variant?.combinations[0];
                    setPrice(price);
                    setCurrentVarientId(_id);
                    setSelectedSize(Size);
                    setSelectedColor(Color);
                    const imgArr = response.data?.variant?.color_images.find((clrObj) => clrObj.color === response.data?.variant?.Color[0])
                    setProductImgObj(response.data?.variant?.color_images)
                    setProductImgs(imgArr.images);
                }
                else{
                    setProductImgs(response.data.product.imageUrls);
                }
                fetchCategoryById(response.data.product.category_id);
                fetchProductsByCategory(response.data.product.category_id);
            }
        } catch (err) {}
    }

    useEffect(() => {
        fetchProductDetails(id);
        fetchRatings(id, 1);
        window.scrollTo(0, 0);
    }, [id])

    const handlePagination = (event, value) => {
        setPages((prev) => ({...prev, currentPage: value}));
        fetchRatings(id, value);
    }

    const fetchCategoryById = async(categoryId) => {
        try{
            const resp = await getCategoryById(categoryId);
            if(resp && resp.data){
                setCategory(resp.data.category);
            }
        } catch (err) {}
    }

    const fetchProductsByCategory = async(categoryId) => {
        const reqBody = { category_id: categoryId, page: 1, limit: 16 };

        try{
            const resp = await getProductsByCategory(reqBody);
            if(resp && resp.data && resp.data.success){
                setProductList(resp.data.products);
            }
        } catch (err) {}
    }

    const checkPrice = (size, color) => {
        const selectedVarient = combinations.find((obj) => obj.Size  === size && obj.Color === color);
        setCurrentVarientId(selectedVarient._id);
        setPrice(selectedVarient.price);
    }

    const changeImgColor = (clr) => {
        const imgArr = productImgObj.find((clrObj) => clrObj.color === clr)
        setProductImgs(imgArr.images);
    }

    const switchImg = (imgIdx) => {
        const newImgObj = [...productImgs];
        newImgObj[0] = productImgs[imgIdx];
        newImgObj[imgIdx] = productImgs[0];
        setProductImgs(newImgObj);
    }

    const getDateFormat = (isoDate) => {
        const date = new Date(isoDate);

        const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        return formattedDate;
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

    const buyProduct = async() => {
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

        const itemObj = {
            product_id: productDetail._id,
            quantity: 1,
            price_per_unit: currentVarientId ? price : productDetail.price,
            total_price: currentVarientId ? price : productDetail.price
        }

        if(currentVarientId){
            itemObj["variant_combination_id"] = currentVarientId
        }

        const reqBody = {
            user_id: user?.userId || "",
            orderedItems: [itemObj],
            shippingAddress: {
                fullName: user?.firstName || "",
                mobile: user?.mobile_number || "",
                addressLine1: user?.landmark || "",
                city: user?.city || "",
                state: user?.state || "",
                postalCode: user?.pin_code || "",
                country: "India"
            },
            paymentMethod: "UPI",
            subtotal: itemObj.total_price,
            tax: 0,
            deliveryCharge: 0
        }

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
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
            verifyPayment(verifyPayload);
            notifyToaster("Order confirmed. Thank you for your purchase!");
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
          notifyToaster("Payment failed: " + errResp.error.description);
        })
      }
        }
        catch(err){
            notifyError();
        }
    }

    const handleCart = async() => {
        const reqBody = {
            user_id: user.userId,
            product_id: id,
            quantity: 1
        }

        if(currentVarientId) reqBody["variant_id"] = currentVarientId;

        try{
            const resp = await addToCart(reqBody);
            if(resp && resp.data){
                notifyToaster("Item added to cart.");
            }
            else{
                notifyError();
            }
        }
        catch(err){
            notifyError();
        }
    }


    if(!productDetail) return null;


    return (
    <div className="py-5 md:py-15 bg-white">
        {/* Breadcrumb */}
        <div className="px-4 md:px-20 mb-6 flex items-center md:text-xl font-bold">
            <span className="mb-1 mr-1.5">Home</span> <FaAngleRight /> <span className="mb-1 mx-1.5">Products</span> <FaAngleRight /> <span className="mb-1 mx-1.5">Product Details</span>
        </div>

            <div className='px-4 md:px-20 w-full flex flex-col lg:flex-row'>
                <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-5">
                    <div className="w-full md:w-36 md:max-h-[550px] flex flex-row md:flex-col justify-between md:gap-4">
                        {[1, 2, 3, 4].map((imgIdx) => (
                            <>
                            {productImgs[imgIdx] ? (
                                <img src={productImgs[imgIdx]} onClick={() => switchImg(imgIdx)} className={`w-[23%] md:w-full ${isVarient ? "h-20 md:h-30" : "h-20 md:h-26"} object-cover rounded`}/>
                            ): (
                                <div className={`w-full ${isVarient ? "h-30" : "h-26"} bg-gray-200 rounded`}></div>
                            )}
                            </>
                        ))}
                    </div>
                    <ImageMagnifier src={productImgs[0]} width={"75%"} height={isVarient ? 550 : 475}/>
                    {/* <img src={productDetail.imageUrls[0]} className={`w-[75%] ${isVarient ? "h-[550px]" : "h-[475px]"} object-cover rounded`}/> */}
                </div>

                {/* Right Section */}
                <div className="mt-7 md:mt-0 md:ml-15 w-full md:w-[40%] flex flex-col items-start">

                    {/* Product Title */}
                    <h1 className="text-xl md:text-3xl font-bold leading-snug">{productDetail.product_name}</h1>

                    {/* Availability */}
                    <div className='flex items-center'>
                        <div className={`px-3 py-0.5 my-2 md:my-4 mr-3 ${productDetail.isActive ? "text-[#027A48] bg-[#ECFDF3]" : "text-[#ff5469] bg-[#ffe8eb]" } font-medium flex items-center rounded-full`}>
                            <span className={`mr-2 w-2 h-2 ${productDetail.isActive ? "bg-[#12B76A]" : "bg-[#ff5469]"} rounded-full`}></span> {productDetail.isActive ? "Available" : "Not Available"}
                        </div>
                        ({ratings.review}) <IoIosStar color='#FFD119' size={20} style={{marginRight:5, marginBottom:3}}/> <div className=''>Reviews</div>
                    </div>

                {/* Price */}
                <div className="text-2xl md:text-3xl font-semibold">₹ {price}</div>

                {/* Features */}
                <ul className="my-4 space-y-1.5 text-[#52525B]">
                    <li className="flex items-center gap-2"><IoEarthOutline /> Free shipping worldwide</li>
                    <li className="flex items-center gap-2"><MdOutlinePayment /> 100% Secured Payment</li>
                    <li className="flex items-center gap-2"><IoPersonOutline /> Made by the Professionals</li>
                </ul>

                {/* Sizes */}
                {isVarient && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Sizes</h2>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => (
                                <button onClick={() => {
                                    setSelectedSize(size);
                                    checkPrice(size, selectedColor);
                                }} className={`py-1 text-center w-15 rounded-md ${selectedSize === size ? "bg-[#F75E69] text-white" : "border border-[#A1A1AA] text-black"}`}>{size}</button>
                            ))}
                        </div>

                        <h2 className="text-lg font-semibold my-2">Colors</h2>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button onClick={() => {
                                    setSelectedColor(color);
                                    checkPrice(selectedSize, color);
                                    changeImgColor(color)
                                }} className={`py-1 w-11 h-10 flex justify-center items-center rounded-lg shadow-xl`} style={{backgroundColor:color}}>
                                    {selectedColor === color && <FaCheck color='#ffffff' size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                    <button onClick={buyProduct} className="py-3 mt-9 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br font-semibold text-white text-[16px] w-full md:w-[90%] rounded-full">Buy Now</button>
                    <button onClick={handleCart} className="py-3 mt-4 border-2 border-[#F75E69] font-semibold text-[#F75E69] text-[16px] w-full md:w-[90%] rounded-full">Add to cart</button>
                </div>
            </div>

            <div className='px-4 md:px-20 my-8 vmd:my-15'>
                <div className='flex'>
                    <div onClick={() => setShowDesc(true)} className={`py-2 mr-6 md:mr-10 mb-[-2px] text-[#717171] font-semibold ${showDesc && 'text-[#F75E69] border-b-2 border-[#F75E69]'} cursor-pointer`}>
                        Description
                    </div>
                    <div onClick={() => setShowDesc(false)} className={`py-2 mb-[-2px] text-[#717171] font-semibold ${!showDesc && 'text-[#F75E69] border-b-2 border-[#F75E69]'} cursor-pointer`}>
                        Rating & Reviews
                    </div>
                </div>
                <div className='mb-12 bg-[#E4E4E7] w-full h-[2px]'></div>

                {showDesc && (
                    <>
                        {typeof(productDetail.description) === "string" && parse(productDetail.description)}
                        {/* {parse(productDetail.description)} */}
                    </>
                )}
            </div>

            {showDesc ? (
                <div className='px-4 md:px-20 mt-15 w-full relative'>
                    <div className='text-2xl font-semibold'>Explore Our Products</div>
                    <div className='py-7 md:py-10 flex justify-start overflow-x-auto'>
                        {productList.map((obj) => (
                            <div className='p-3 mr-5 md:mr-14 min-w-[220px] md:min-w-[260px] bg-white rounded-xl shadow-lg md:shadow-[0px_15px_40px_0px_#9D9D9D40]'>
                                {obj.imageUrls.length > 0 && obj.imageUrls[0] ? (
                                    <img src={obj.imageUrls[0]} className='h-[160px] md:h-[180px] w-full bg-[#D9D9D9] object-cover rounded'/>
                                ) : (
                                    <div className='p-10 h-[180px] bg-[#D9D9D9] rounded'></div>
                                )}
                                <div className='pt-3 text-left'>
                                    <div className='text-[#3B3B3B] text-[15px] leading-none'>{obj.product_name}</div>
                                    <div className='mt-1.5 text-[#7B7B7B] text-[13px] font-semibold'>{"Category > "} {category}</div>
                                    <div className='mt-4 flex justify-between items-center'>
                                        <div className='text-[#3B3B3B] text-lg font-semibold'>₹ {obj.price}</div>
                                        <Link to={`/product/${obj._id}`} className="px-5 py-1 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br text-white text-sm rounded-full">Buy Now</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='px-20 mt-[-30px]'>
                    {ratings.ratingsArr.map((obj) => (
                        <div className='py-8 flex border-b border-[#F4F4F5]'>
                            <IoPersonCircleSharp className='text-[70px]' />
                            <div className='ml-10'>
                                <Rating name="read-only" value={obj.rating} readOnly />
                                <div className='mt-1 mb-6'>{obj.review}</div>
                                <div className='mb-1 font-semibold'>{obj.customerId.first_name}</div>
                                <div>{getDateFormat(obj.createdAt)}</div>
                            </div>
                        </div>
                    ))}

                    <div className='mt-2 mb-10 w-full flex justify-center'>
                        <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
                    </div>
                </div>
            )}
      </div>
    );
}

export default ProductDetails
