import { useState, useEffect } from "react";
import { FaFacebookF } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import logo from "../assets/logo.jpeg";
import { useNavigate } from "react-router";
import { getAllCategories } from "../api/products";


const Footer = () => {
    const navigate = useNavigate();
    const [categoryList, setCategoryList] = useState([]);
    const [categoryIdAndName, setCategoryIdAndName] = useState({});

    const handleFb = () => {
        const fbLink = 'https://www.facebook.com/profile.php?id=61577898151078';
        window.open(fbLink, '_blank'); // Opens in new tab
    };

    const handleInsta = () => {
        const instaLink = 'https://www.instagram.com/acb_artandcraftfrombharat?igsh=djlicHJhZDF2eXcy';
        window.open(instaLink, '_blank'); // Opens in new tab
    };

    const fetchCategories = async() => {
        try{
            const resp = await getAllCategories();
            if(resp && resp.data){
                const newArr = resp.data.slice(0, 3);
                setCategoryList(newArr);

                resp.data.map((obj) => {
                    setCategoryIdAndName((prev) => ({...prev, [obj._id]: obj.category}));
                })
            }
        } catch (err) {}
    }

    useEffect(() => {
        fetchCategories();
    }, [])

  return (
    <div className='px-6 md:px-10 py-12 bg-gradient-to-r from-[#8F44FF] to-[#FF6163]'>
                <div className='flex flex-col md:flex-row items-start justify-between'>
    
                    <div className='w-full md:w-[33%]'>
                        <img src={logo} className="h-18" />
                        <div className='mt-3 text-white'>Explore timeless, handcrafted pieces created by skilled artisans—each one infused with heart, heritage, and creativity, woven together to bring meaning, beauty, and story into every detail. Every creation tells a story rooted in tradition and shaped by hand. Our collection celebrates the artistry and soul behind each handmade piece.</div>
                    </div>
                    
                    <div className='mt-6 md:mt-0 w-full md:w-[50%] flex flex-col md:flex-row justify-evenly'>
                        <div className='text-white'>
                            <div className='mb-3 font-semibold text-lg'>Quick Links</div>
                            <div onClick={() => navigate("/")} className="mb-2 cursor-pointer">Home</div>
                            <div onClick={() => navigate("/return-and-refund")} className="cursor-pointer">Return & Refund Policy</div>
                            {/* <div>Terms & Conditions</div> */}
                            {/* <div className='my-2'>Privacy Policy</div> */}
                        </div>
    
                        <div className='mt-6 md:mt-0 text-white'>
                            <div className='mb-3 font-semibold text-lg'>Categories</div>
                            {categoryList.map((obj) => (
                                <div className='my-2 cursor-pointer' onClick={() => navigate("/products", {state: { categoryId: obj._id, categoryName: categoryIdAndName[obj._id] }})}>{obj.category}</div>
                            ))}
                        </div>
    
                        <div className='mt-6 md:mt-0 text-white'>
                            <div className='mb-3 font-semibold text-lg'>Get in Touch</div>
                            <div className="flex items-center">Email: <a href="mailto:artandcraftfrombharat@gmail.com" className="ml-1">artandcraftfrombharat@gmail.com</a></div>
                            <div>Contact: +91-9211322707</div>
                            <div>Social Media Links</div>
                            <div className='mt-3 flex'>
                                <div onClick={handleFb} className='w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer'>
                                    <FaFacebookF style={{color:"#FC3778"}}/>
                                </div>
                                <div onClick={handleInsta} className='ml-2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer'>
                                    <RiInstagramFill style={{color:"#FC3778"}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className='my-4 w-full h-[1px] bg-white'></div>
                <div className='text-white text-center'>Copyright © 2025. All rights reserved</div>
            </div>
  )
}

export default Footer