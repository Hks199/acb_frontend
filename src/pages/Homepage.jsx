import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import btnBgGradient from '../assets/landing/btn-bg-gradient.png';
import leftGradient from '../assets/landing/left-gradient.png';
import rightGradient from '../assets/landing/right-gradient.png';
import leftDots from '../assets/landing/left-dots.svg';
import rightDots from '../assets/landing/right-dots.svg';
import ArtGalleryImg from '../assets/landing/art-gallery.png';
import logo from "../assets/logo.jpeg";
import { useNavigate, Link, useLocation } from 'react-router';
import Marquee from "react-fast-marquee";
import { getAllCategories, getAllProducts } from '../api/products';
import { contact } from '../api/contact';
import { notifyError, notifyToaster } from '../components/notifyToaster';


const bgColor = "F8FAFC";
const textClr = "text-[#2C2C2C]";


const Homepage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [categoryIdAndName, setCategoryIdAndName] = useState({});
    const [contactForm, setContactForm] = useState({ first_name:"", last_name:"", phone:"", email:"", message: "", checkbox: false })

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [])

    const fetchCategories = async() => {
        try{
            const resp = await getAllCategories();
            if(resp && resp.data){
                setCategoryList(resp.data);

                resp.data.map((obj) => {
                    setCategoryIdAndName((prev) => ({...prev, [obj._id]: obj.category}));
                })
            }
        } catch (err) {}
    }

    const fetchProducts = async() => {
        const reqBody = { page: 1, limit: 8 };

        try{
            const resp = await getAllProducts(reqBody);
            if(resp && resp.data && resp.data.success){
                setProductList(resp.data.products);
            }
        } catch (err) {}
    }

    const handleContact = async() => {
        // if(!contactForm.checkbox){
        //     notifyToaster("Please agree to the privacy policy to continue!");
        //     return;
        // }

        const reqbody = {
            name : contactForm.first_name + " " + contactForm.last_name,
            number : contactForm.phone,
            email : contactForm.email,
            requirements : contactForm.message
        }

        try{
            const resp = await contact(reqbody);
            if(resp && resp.data && resp.data.success){
                notifyToaster("Thank you. We’ll get back to you shortly.");
            }
            else{
                notifyError();
            }
        }
        catch(err){
            notifyError();
        }
    }

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
        const scrollY = window.scrollY;
        setVisible(scrollY < 350); // Hide if scrolled more than 100px
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    useEffect(() => {
        if (location.hash === "#about") {
            const el = document.getElementById("about");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
        else if(location.hash === "#contact"){
            const el = document.getElementById("contact");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }, [location]);

    return (
        <div className={`w-full bg-[#${bgColor}] relative overflow-x-hidden ${textClr}`}>
            <div className='h-[100vh] flex justify-center items-center z-10'>
                <motion.div animate={{opacity: visible ? 1 : 0, y: visible ? 0 : -20}} className='z-20'>
                    <div className='text-center text-[21px] md:text-[37px] font-bold'>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}} className='w-full flex md:hidden justify-center'>
                            <img src={logo} className='mb-6 h-40' />
                        </motion.div>
                        <motion.div initial={{x:-100, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.3}}>Unique. Timeless. <span className='text-[#7A38FF]'>Handmade</span>.</motion.div>
                        <motion.div initial={{x: 200, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.3}}><span className='text-[#FF5E5E]'>Art</span> that feels like home.</motion.div>
                        <motion.div initial={{x:-100, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.3}}>Discover <span className='text-[#FFC336]'>beauty</span> in every piece.</motion.div>
                    </div>

                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className='mt-6 text-[#8F8F8F] text-center text-[12px] md:text-[17px]'>
                        <div className='hidden md:inline-block w-[85%]'>Discover timeless, handcrafted art and craft pieces that add soul, warmth, and</div>
                        <div className='hidden md:inline-block w-[85%]'>story to your everyday spaces. From skilled hands to your home.</div>

                        <div className='px-10 inline-block md:hidden'>Discover timeless, handcrafted art and craft pieces that add soul, warmth, and story to your everyday spaces. From skilled hands to your home.</div>
                    </motion.div>


                    <motion.div
                        initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.3, type:"spring", stiffness:250}}
                        className='mt-10 flex justify-center items-center relative'
                    >
                        <img src={btnBgGradient} className='h-[65px] md:h-[80px] object-contain absolute bottom-[-12px] md:bottom-[-18px]' />
                        <motion.button
                            onClick={() => navigate("/products")}
                            className="px-8 py-3 z-10 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br font-semibold text-white text-[12px] md:text-[16px] rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{type:"spring", stiffness:300}}
                        >
                            Shop Now & Own the Handmade
                        </motion.button>
                    </motion.div>
                </motion.div>

                <img src={leftGradient} className='absolute left-[-5%] top-[-5%] scale-[130%]' />
                <img src={rightGradient} className='absolute right-[-8%] top-[-20%] scale-[130%]' />
            </div>

            <div className='w-full text-center relative'>
                <div className='mb-3 text-2xl font-semibold'>Explore Our Categories</div>
                <div className='px-2'>Discover a world of handcrafted beauty—explore curated categories filled with unique art,</div>
                <div className='px-2'>décor, and meaningful creations.</div>

                <img src={leftDots} className='hidden md:block absolute left-0 top-[60px] scale-[125%]' />
                <img src={rightDots} className='hidden md:block absolute right-0 top-0 scale-[125%]' />

                <div className='mt-5 md:mt-16 w-full flex justify-center items-center flex-wrap'>
                    <div className='w-[95%] md:w-[83%]'>
                        <Marquee autoFill gradient>
                            {categoryList.map((obj) => (
                                <>
                                    <div key={obj._id} onClick={() => navigate("/products", {state: { categoryId: obj._id, categoryName: categoryIdAndName[obj._id] }})} className='m-5 mb-2 md:m-7 md:mb-2 z-10 w-[65px] h-[65px] md:w-[100px] md:h-[100px] flex justify-center items-center border border-[3.5px] border-[#FF5E5E] rounded-full'>
                                        {obj.imageUrls ? (
                                            <img src={obj.imageUrls} className='w-[90%] h-[90%] md:w-20 md:h-20 object-cover rounded-full' />
                                        ) : (
                                            <div className='w-[90%] h-[90%] md:p-10 bg-[#D9D9D9] rounded-full'></div>
                                        )}
                                    </div>
                                    <div className='text-sm md:text-base'>{obj.category}</div>
                                </>
                            ))}
                        </Marquee>
                    </div>
                </div>
            </div>

            <div className='mt-14 md:mt-[10%] min-h-[100vh] w-full text-center relative'>
                <div className='mb-3 text-2xl font-semibold'>Curated Treasures</div>
                <div className='px-4'>Hand-selected works of art and craft that capture the essence of thoughtful design and handmade elegance.</div>

                <div className='px-2 lg:px-8 mt-20 md:mt-14 scale-[105%] flex flex-wrap justify-center'>
                    {productList.map((obj) => (
                        <div key={obj._id} className='p-3 m-5 md:m-7 w-[260px] bg-white rounded-xl shadow-[0px_15px_100px_0px_#9D9D9D40]'>
                            {obj.imageUrls.length > 0 && obj.imageUrls[0] ? (
                                <img src={obj.imageUrls[0]} className='h-[180px] w-full bg-[#D9D9D9] object-cover rounded'/>
                            ) : (
                                <div className='p-10 h-[180px] bg-[#D9D9D9] rounded'></div>
                            )}
                            <div className='pt-3 text-left'>
                                <div className='text-[#3B3B3B] text-[15px] leading-none'>{obj.product_name}</div>
                                <div className='mt-1.5 text-[#7B7B7B] text-[13px] font-semibold'>{"Category > "} {categoryIdAndName[obj.category_id]}</div>
                                <div className='mt-4 flex justify-between items-center'>
                                    <div className='text-[#3B3B3B] text-lg font-semibold'>₹ {obj.price}</div>
                                    <Link to={`/product/${obj._id}`} className="px-5 py-1 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br text-white text-sm rounded-full">Buy Now</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div id='about' className='mt-20 w-full text-center relative'>
                <div className='mb-3 text-2xl font-semibold'>Our Gallery</div>
                <div className='w-full flex justify-center'>
                    <div className='px-2 md:w-[65%]'>ACB, Art and craft from Bharat is an unique idea and a platform to provide an incomparable space for the different artists and artisans to support each- other and grow as a community.</div>
                </div>

                <div className='mt-8 flex flex-col md:flex-row justify-center items-center'>
                    <img src={ArtGalleryImg} className='md:mr-16 w-[85%] md:w-[35%] object-contain' />
                    <div className='mt-8 md:mt-0 text-center w-[90%] md:w-[40%]'>
                        <div  className='mb-6 font-semibold text-xl'>More Than a Gallery – A Space Where Imagination, Talent, and Culture Intersect</div>
                        <div>To preserve the cultural diversity, richness, uniqueness and vastness exhibited in various art forms and also to promote the evolving richness in the local craftmanship.</div>
                        <div className='mt-6'>“The transforming journey of arts from various places on a single window" encapsulates the idea of experiencing diverse artistic expressions and cultural narratives in a unified and accessible way, often through digital platforms or curated exhibitions. This can involve showcasing traditional art forms alongside contemporary works, highlighting the evolution of artistic styles, and exploring themes that resonate across different cultures.</div>
                    </div>
                </div>
            </div>

            <div id="contact" className='md:px-20 mt-20 mb-30 w-full text-center relative'>
                <div className='mb-3 text-2xl font-semibold'>Get in Touch</div>
                <div className='px-2 md:px-0'>Have a question or a custom request? We’d love to hear from you—reach out and let’s connect!</div>

                <div className='mt-8 px-4 md:px-0 flex flex-col md:flex-row justify-center items-start text-left'>
                    <div className='md:mr-16 w-full md:w-[45%]'>
                        <div className='flex flex-col md:flex-row justify-between'>
                            <div className='w-full md:w-[48%]'>
                                <div className='ml-1 text-[#344054]'>First Name</div>
                                <input
                                    placeholder='First Name'
                                    className='p-2 mt-1.5 mb-4 md:mb-0 w-full bg-white border border-[#FF5E5E] rounded-md'
                                    value={contactForm.first_name} onChange={(e) => setContactForm((prev) => ({...prev, first_name: e.target.value}))}
                                />
                            </div>
                            <div className='w-full md:w-[48%]'>
                                <div className='ml-1 text-[#344054]'>Last name</div>
                                <input
                                    placeholder='Last Name'
                                    className='p-2 mt-1.5 w-full bg-white border border-[#FF5E5E] rounded-md'
                                    value={contactForm.last_name} onChange={(e) => setContactForm((prev) => ({...prev, last_name: e.target.value}))}
                                />
                            </div>
                        </div>

                        <div className='mt-4 ml-1 text-[#344054]'>Email</div>
                        <input
                            placeholder='you@example.com'
                            className='p-2 mt-1.5 w-full bg-white border border-[#FF5E5E] rounded-md'
                            value={contactForm.email} onChange={(e) => setContactForm((prev) => ({...prev, email: e.target.value}))}
                        />

                        <div className='mt-4 ml-1 text-[#344054]'>Phone Number</div>
                        <input
                            placeholder='+91 - xxxx xxx xxx'
                            className='p-2 mt-1.5 w-full bg-white border border-[#FF5E5E] rounded-md'
                            value={contactForm.phone} onChange={(e) => setContactForm((prev) => ({...prev, phone: e.target.value}))}
                        />
                    </div>

                    <div className='text-left mt-4 md:mt-0 w-full md:w-[45%] flex flex-col justify-between md:min-h-[250px]'>
                        <div>
                            <div className='ml-1 text-[#344054]'>Message</div>
                            <textarea rows={4} className='p-2 mt-1.5 w-full bg-white border border-[#FF5E5E] rounded-md'
                                value={contactForm.message} onChange={(e) => setContactForm((prev) => ({...prev, message: e.target.value}))}
                            />
                        </div>

                        {/* <div className='mt-6 mb-2 flex items-center'>
                            <input type="checkbox" style={{ transform: 'scale(1.3)', marginTop:5, marginRight: 10 }}
                                value={contactForm.checkbox} onChange={(e) => setContactForm((prev) => ({...prev, checkbox: e.target.checked}))}
                            />
                            <span className='text-[#667085]'>You agree to our friendly</span>
                            <span className='ml-1 text-[#344054] underline'>privacy policy.</span>
                        </div> */}

                        <button onClick={handleContact} className="p-2 w-full bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br font-semibold text-white text-[12px] md:text-[16px] rounded-md">Send message</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Homepage
