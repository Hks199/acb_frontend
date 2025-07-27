import { useState, useEffect } from 'react'
import { FaRegCircleUser, FaQuoteRight, FaQuoteLeft } from "react-icons/fa6";
import Marquee from "react-fast-marquee";
import { getAllVendors } from '../../api/vendor';
import Pagination from '@mui/material/Pagination';


const VendorList = () => {
    const [showGallery, setShowGallery] = useState("");
    const [allVendorList, setAllVendorList] = useState([]);
    const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });

    const fetchAllVendors = async (pageNum) => {
        const reqBody = { page:pageNum, limit:10 }

        try{
            const resp = await getAllVendors(reqBody);
            // console.log(resp.data)
            if(resp && resp.data && resp.data.success){
                setAllVendorList(resp.data.data);
                setPages({ totalPages: resp.data.totalPages, currentPage: resp.data.page })
            }
        }
        catch(err){}
    }

    useEffect(() => {
        fetchAllVendors(1);
    }, [])

    const handlePagination = (event, value) => {
        setPages((prev) => ({...prev, currentPage: value}));
        fetchAllVendors(value);
    }

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-gradient-to-r from-zinc-50 via-fuchsia-50 to-red-50'>
        <div className='px-4 md:px-0 my-6 md:w-[80%] text-center'>
            <div className='mb-2 text-xl md:text-2xl font-semibold text-[#ff5469]'>Artist Gallery - The Creative Minds Behind Every Masterpiece</div>
            <div className='text-gray-600 md:text-xl flex'><FaQuoteLeft color='#ff5469'/> Dive into the stories, styles, and journeys of our featured artists. This gallery celebrates the talent and passion of creators who bring unique visions to life — discover who they are and what inspires them. <FaQuoteRight color='#ff5469'/></div>
        </div>

        {allVendorList.map((obj, idx) => (
            <div onClick={() => setShowGallery((prev) => prev === idx ? "" : idx)} className='p-5 mb-6 w-[90%] md:w-[80%] min-h-[100px] bg-white rounded-xl shadow-[0px_4px_30px_-15px_rgba(0,_0,_0,_0.1)]'>
                <div className='mb-5 flex items-center'>
                    <FaRegCircleUser style={{width:60, height: 60}}/>
                    <div className='ml-5 flex flex-col items-start'>
                        <div className='font-semibold text-lg'>{obj.vendor_name}</div>
                            <div className={`px-3 py-0.5 mt-2 text-[#ff5469] bg-[#ffe8eb] font-medium flex items-center rounded-full`}>
                            <span className={`mr-2 w-2 h-2 bg-[#ff5469] rounded-full`}></span> {obj.art_type}
                        </div>
                    </div>
                </div>

                <div>{obj.description}</div>

                {showGallery === idx && (
                    <div className='mt-4 flex'>
                        <Marquee autoFill>
                            {obj.imageUrls.map((imgUrl) => (
                                <>
                                    <img src={imgUrl} className='mr-4 w-[200px] h-[180px] bg-gray-200 rounded object-cover' />
                                </>
                                // <div className='mr-4 w-[200px] h-[180px] bg-gray-200 rounded'></div>
                            ))}
                        </Marquee>
                    </div>
                )}
            </div>
        ))}

        <div className='mt-2 mb-10 w-full flex justify-center'>
            <Pagination count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
        </div>
    </div>
  )
}

export default VendorList