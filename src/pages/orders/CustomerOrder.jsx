import { useState, useEffect, useRef } from 'react';
import { cancelledOrders, cancelOrReturnOrderItem, getUserOrderedProducts, returnedOrders } from '../../api/orders';
import useUserHook from '../../context/UserContext';
import IconButton from '@mui/material/IconButton';
import { MdCancel } from "react-icons/md";
import { HiPlus } from "react-icons/hi";
import Rating from '@mui/material/Rating';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { createReview } from '../../api/ratings';
import { notifyError, notifyToaster } from '../../components/notifyToaster';


const CustomerOrder = () => {
  const { user } = useUserHook();
  const [orderList, setOrderList] = useState([]);
  const [cancelledList, setCancelledList] = useState([]);
  const [returnedList, setReturnedList] = useState([]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  const inputRef = useRef(null);
  const [previewArr, setPreviewArr] = useState([]);
  const [imgArr, setImgArr] = useState([]);
  const [selectedTab, setSelectedTab] = useState(1);
  const [pages, setPages] = useState({ totalPages: 1, currentPage: 1, totalPages2: 1, currentPage2: 1, totalPages3: 1, currentPage3: 1 });
  const [openDialog, setOpenDialog] = useState(false);
  const [ratings, setRatings] = useState({ rating: 0, review: "", ratingsArr: [], productId: "" });


  const handleDialogOpen = (prodId) => {
    setRatings((prev) => ({...prev, productId: prodId}));
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setRatings((prev) => ({...prev, productId: ""}));
    setOpenDialog(false);
  };

  const addReview = async() => {
    const reqBody = {
        productId : ratings.productId,
        customerId : user.userId,
        rating : ratings.rating,
        review : ratings.review
    }
  
    try{
        const resp = await createReview(reqBody);
        if(resp && resp.data && resp.data.success){
          setRatings((prev) => ({...prev, rating: 4, review: "", productId: ""}));
          handleDialogClose();
          notifyToaster("Thank you! Your review has been submitted.");
        }
    }
    catch(err){
      if(err.response.data.errorType === "DuplicateReview"){
        notifyToaster("You’ve already submitted a review for this order.");
      }
      else{
        notifyError();
      }
    }
  }

  const handleClick = () => {
    if(previewArr.length > 4){
      notifyToaster("You can upload maximum four images");
      return;
    }

    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isValidType = ['image/jpeg', 'image/png'].includes(file.type);

    if (!isValidType) {
      notifyToaster('Only JPG and PNG files are allowed.');
      return;
    }

    // Create a temporary URL for preview
    const imagePreview = URL.createObjectURL(file);
    setPreviewArr((prev) => ([...prev, imagePreview]));
    // setPreviewArr((prev) => ([...prev, file]));
    setImgArr((prev) => ([...prev, file]));
  };

  const removeImg = (idx) => {
    const arr = [...previewArr];
    const arr2 = [...imgArr];
    arr.splice(idx, 1);
    arr2.splice(idx, 1);
    setPreviewArr(arr);
    setImgArr(arr2);
  }

  const handleCancel = (order) => {
      setOpen(true);
      setOrderDetail(order);
    };

    const handleClose = () => {
        setOpen(false);
    };

  const getOrderList = async(pageNum) => {
      const reqBody = { user_id : user.userId, limit : 12 , page : pageNum }

      try{
        const resp = await getUserOrderedProducts(reqBody);
        if(resp && resp.data && resp.data.success){
          setPages((prev) => ({...prev, currentPage: resp.data.currentPage, totalPages: resp.data.totalPages }));
          setOrderList(resp.data.data);
        }
      }
      catch(err){}
    }

    const getCancelledOrderList = async(pageNum) => {
      const reqBody = { user_id : user.userId, limit : 12, page : pageNum }

      try{
        const resp = await cancelledOrders(reqBody);
        if(resp && resp.data && resp.data.success){
          setCancelledList(resp.data.data);
          setPages((prev) => ({...prev, currentPage2: resp.data.currentPage, totalPages2: resp.data.totalPages }));
        }
      }
      catch(err){}
    }

    const getReturnedOrderList = async(pageNum) => {
      const reqBody = { user_id : user.userId, limit : 12, page : pageNum }

      try{
        const resp = await returnedOrders(reqBody);
        if(resp && resp.data && resp.data.success){
          setReturnedList(resp.data.data);
          setPages((prev) => ({...prev, currentPage3: resp.data.currentPage, totalPages3: resp.data.totalPages }));
        }
      }
      catch(err){}
    }

  const handlePagination = (event, value) => {
    setPages((prev) => ({...prev, currentPage: value}));
    getOrderList(value);
  }

  const handlePagination2 = (event, value) => {
    setPages((prev) => ({...prev, currentPage2: value}));
    getCancelledOrderList(value);
  }

  const handlePagination3 = (event, value) => {
    setPages((prev) => ({...prev, currentPage3: value}));
    getReturnedOrderList(value);
  }

  useEffect(() => {
    getOrderList(1);
    getCancelledOrderList(1);
    getReturnedOrderList(1);
  }, [])

  const getDateFormat = (isoDate) => {
    const date = new Date(isoDate);

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formattedDate;
  }

  const handleCancelOrReturnOrder = async() => {
    const formData = new FormData();
    formData.append("status", orderDetail.orderStatus === "Pending" ? "Cancelled" : "Returned");
    formData.append("user_id", user.userId);
    formData.append("orderId", orderDetail.order_id);
    formData.append("productId", orderDetail.product_id);

    if(orderDetail.orderStatus === "Pending"){
      formData.append("cancellationReason", reason);
    }
    else{
      formData.append("returnReason", reason);
      // formData.append("returnImages", [img1]);
      imgArr.forEach((file) => {
        if (file instanceof File) {
          formData.append("returnImages", file); // or "returnImages[]" depending on backend
        }
      });
    }

    try{
      const resp = await cancelOrReturnOrderItem(formData);
      if(resp && resp.data){
        const msg = orderDetail.orderStatus === "Pending" ? "Your order has been cancelled successfully." : "Return request submitted. We’ll process it shortly.";
        handleClose();
        notifyToaster(msg);
        getOrderList(1);
        if(orderDetail.orderStatus === "Pending"){
          getCancelledOrderList(1);
        }
        else{
          getReturnedOrderList(1);
        }
      }
      else{
        notifyError();
      }
    }
    catch(err){
      if(err.response.data.message){
        notifyToaster(err.response.data.message);
      }
      else{
        notifyError();
      }
    }
  }


  return (
    <div className="px-4 py-6 md:px-20 md:py-10 w-full min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-1">Order Details</h1>
      <p className="text-sm text-gray-500 mb-8">Check the status of recent and old orders & discover more products</p>

      <div className='mb-4 flex'>
        <div className='w-full md:w-auto flex items-start text-sm bg-gray-100 rounded-md'>
          <button onClick={() => setSelectedTab(1)} style={{backgroundColor: selectedTab === 1 ? "#F75E69" : "", color: selectedTab === 1 ? "#ffffff" : "#F75E69"}} className='px-4 py-2 text-[11px] md:text-base font-semibold rounded-md cursor-pointer'>Order List</button>
          <button onClick={() => setSelectedTab(2)} style={{backgroundColor: selectedTab === 2 ? "#F75E69" : "", color: selectedTab === 2 ? "#ffffff" : "#F75E69"}} className='px-4 py-2 w-[40%] md:w-auto text-[11px] md:text-base font-semibold rounded-md cursor-pointer'>Cancelled Orders</button>
          <button onClick={() => setSelectedTab(3)} style={{backgroundColor: selectedTab === 3 ? "#F75E69" : "", color: selectedTab === 3 ? "#ffffff" : "#F75E69"}} className='px-4 py-2 w-[35%] md:w-auto text-[11px] md:text-base font-semibold rounded-md cursor-pointer'>Returned Orders</button>
        </div>
      </div>

      {selectedTab === 1 ? (
        <>
          {orderList.map((order) => (
            <div key={order.order_id} className="border border-gray-300 rounded-lg mb-6 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between md:justify-start px-6 py-4 bg-gray-100">
                <div className='mb-3 md:mb-0 md:w-[20%]'>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{order.order_id}</p>
                </div>
                <div className='mb-3 md:mb-0 md:w-[20%]'>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{getDateFormat(order.orderedAt)}</p>
                </div>
                <div className='md:w-[20%]'>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold text-[#36BA83]">₹{order.total_price}</p>
                </div>
              </div>

              <div className="divide-y">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-gray-300 px-6 py-4">
                    <div className="mb-4 md:mb-0 flex items-center gap-4">
                      <img
                        src={order.product_image}
                        className={`w-12 h-12 rounded-md text-white flex items-center justify-center text-lg font-medium`}
                      />
                      <div>
                        <p className="font-medium text-sm">{order.product_name}</p>
                        {order.variant_combination && (
                          <div>
                            <p className="text-xs text-gray-500">
                              Color: {order.variant_combination.Color}
                            </p>
                            <p className="text-xs text-gray-500">
                              Size: {order.variant_combination.Size}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex'>
                      {(order.orderStatus === "Delivered" || order.orderStatus === "Shipped") && (
                        <button onClick={() => handleDialogOpen(order.product_id)} className="mr-3 flex items-center border border-[#F75E69] text-sm text-[#F75E69] font-medium rounded-md px-4 py-2">
                            Add a Review
                          </button>
                      )}
                      <div className="mr-3 flex items-center bg-[#ECFDF3] text-sm text-[#027A48] font-medium rounded-md px-4 py-2">
                        <span className='mr-2 w-1.5 h-1.5 rounded-full bg-[#027A48]'></span>
                        {order.orderStatus}
                      </div>

                      {order.orderStatus === "Pending" ? (
                        <button onClick={() => handleCancel(order)} className="flex items-center border border-[#F75E69] text-sm text-[#F75E69] font-medium rounded-md px-4 py-2">
                          Cancel Order
                        </button>
                      ) : (
                        <button onClick={() => handleCancel(order)} className="flex items-center border border-[#F75E69] text-sm text-[#F75E69] font-medium rounded-md px-4 py-2">
                          Return Order
                        </button>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          ))}

          <div className='mt-10 w-full flex justify-center'>
            <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
          </div>
        </>
      ) : selectedTab === 2 ? (
        <>
          {cancelledList.map((order) => (
            <OtherOrderList order={order} />
          ))}

          <div className='mt-10 w-full flex justify-center'>
            <Pagination count={pages.totalPages2} variant="outlined" shape="rounded" onChange={handlePagination2} />
          </div>
        </>
      ) : (
        <>
          {returnedList.map((order) => (
            <OtherOrderList order={order} />
          ))}

          <div className='mt-10 w-full flex justify-center'>
            <Pagination count={pages.totalPages3} variant="outlined" shape="rounded" onChange={handlePagination3} />
          </div>
        </>
      )}



      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>{orderDetail?.orderStatus === "Pending" ? "Cancel Order" : "Return Order"}</div>
          <IconButton style={{marginRight:-10}} onClick={handleClose}><MdCancel size={20}/></IconButton>
        </DialogTitle>
        <DialogContent>
          <div className='w-[450px]'>
            {orderDetail?.orderStatus !== "Pending" && (
              <div className='mb-4 flex'>
                {previewArr.map((imgLink, idx) => (
                  <div className="mr-3 w-18 h-18 relative rounded">
                    <IconButton onClick={() => removeImg(idx)} style={{position:"absolute", top:-5, right:-5, color:"#111111"}}><MdCancel size={14}/></IconButton>
                    <img src={imgLink} className="w-full h-full object-cover rounded" />
                  </div>
                ))}

                {previewArr.length < 4 && (
                  <div
                    onClick={handleClick}
                    className="w-18 h-18 border-2 border-dashed border-gray-400 text-gray-400 hover:text-[#FF5E5E] flex items-center justify-center cursor-pointer rounded hover:border-[#FF5E5E] transition"
                  >
                    <HiPlus style={40}/>
                  </div>
                )}
              </div>
            )}

            <input type="file" accept="image/jpeg, image/png" ref={inputRef} onChange={handleImageChange} style={{ display: 'none' }}/>
            <div className='mt-3 mb-1 text-[#FF5E5E]'>Reason for {orderDetail?.orderStatus === "Pending" ? "cancellation" : "return"}</div>
            <textarea className='p-3 mb-2 w-full h-[150px] border-2 border-[#e3e3e3] rounded-lg outline-none'
                value={reason} onChange={(e) => setReason(e.target.value)}
            />
            <button onClick={handleCancelOrReturnOrder} className="py-3 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br font-semibold text-white text-[12px] md:text-[16px] w-full rounded-lg">Confirm</button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={openDialog} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Product Review"}</DialogTitle>
          <DialogContent>
            <div className='w-[450px]'>
              <div className='mb-1 text-[#FF5E5E]'>Rate this product</div>
              <Rating
                name="simple-controlled"
                value={ratings.rating}
                onChange={(event, newValue) => setRatings((prev) => ({...prev, rating: newValue}))}
              />

              <div className='mt-3 mb-1 text-[#FF5E5E]'>Add a review</div>
              <textarea className='p-3 mb-2 w-full h-[150px] border-2 border-[#e3e3e3] rounded-lg outline-none'
                value={ratings.review} onChange={(e) => setRatings((prev) => ({...prev, review: e.target.value}))}
              />
              <button onClick={addReview} className="py-3 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br font-semibold text-white text-[12px] md:text-[16px] w-full rounded-lg">Submit Review</button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const OtherOrderList = ({order}) => {
  const getDateFormat = (isoDate) => {
    const date = new Date(isoDate);

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formattedDate;
  }

  return(
    <div key={order.order_id} className="border border-gray-300 rounded-lg mb-6 overflow-hidden">
          <div className="flex flex-col md:flex-rowjustify-between md:justify-start px-6 py-4 bg-gray-100">
            <div className='mb-3 md:mb-0 md:w-[20%]'>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div className='mb-3 md:mb-0 md:w-[20%]'>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{getDateFormat(order.orderedAt)}</p>
            </div>
            <div className='md:w-[20%]'>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-[#36BA83]">₹{order.total_price}</p>
            </div>
          </div>
          <div className="divide-y">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-300 px-6 py-4">
                <div className="mb-4 md:mb-0 flex items-center gap-4">
                  <img
                    src={order.product_image}
                    className={`w-12 h-12 rounded-md text-white flex items-center justify-center text-lg font-medium`}
                  />
                  <div>
                    <p className="font-medium text-sm">{order.product_name}</p>
                    {order.variant_combination && (
                      <div>
                        <p className="text-xs text-gray-500">
                          Color: {order.variant_combination.Color}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {order.variant_combination.Size}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mr-3 flex items-center bg-[#ffedf2] text-sm text-[#FF5E5E] font-medium rounded-md px-4 py-2">
                  <span className='mr-2 w-1.5 h-1.5 rounded-full bg-[#FF5E5E]'></span>
                  {order?.refundStatus}
                </div>
              </div>
          </div>
        </div>
  )
}

export default CustomerOrder
