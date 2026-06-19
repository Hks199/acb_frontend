import { useState, useEffect } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router";
import { getAllCategories, getAllProducts, getProductsByCategory } from "../../api/products";
import Pagination from '@mui/material/Pagination';


const AllProducts = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState("All");
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [categoryIdAndName, setCategoryIdAndName] = useState({});
    const [pages, setPages] = useState({ totalPages: 1, currentPage: 1 });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        window.scrollTo({ top: 0});
        fetchCategories();
        selectCategory(id ? id : "");
    }, [])

    useEffect(() => {
        if(id){
            fetchProductsByCategory(id);
        }
        else{
            fetchProducts(1);
        }
    }, [id])


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

    const fetchProducts = async(pageNum) => {
        setLoading(true);
        const reqBody = { page: pageNum, limit: 16 };

        try{
            const resp = await getAllProducts(reqBody);
            if(resp && resp.data && resp.data.success){
                setProductList(resp.data.products);
                setPages({ totalPages: resp.data.totalPages, currentPage: resp.data.currentPage })
            }
        } catch (err) {}
        finally{
            setLoading(false);
        }
    }

    const fetchProductsByCategory = async(categoryId) => {
        // navigate(`/products/${categoryId}`);
        setLoading(true);
        const reqBody = { category_id: categoryId, page: 1, limit: 16 };
        
        try{
            const resp = await getProductsByCategory(reqBody);
            if(resp && resp.data && resp.data.success){
                setProductList(resp.data.products);
                setPages({ totalPages: resp.data.totalPages, currentPage: resp.data.page })
            }
        } catch (err) {}
        finally{
            setLoading(false);
        }
    }

    const handlePagination = (event, value) => {
        window.scrollTo({ top: 0});
        setPages((prev) => ({...prev, currentPage: value}));
        fetchProducts(value);
    }

    const selectCategory = (categoryId) => {
        const data = categoryList.filter((obj) => obj._id === categoryId);
        if(data.length > 0 && data[0].category){
            setCategoryName(data[0]?.category)
        }
        else{
            setCategoryName("All");
        }
        if(categoryId){
            navigate(`/products/${categoryId}`)
            fetchProductsByCategory(categoryId);
        }
        else{
            navigate(`/products`)
            fetchProducts(1);
        }
    }


    return (
        <div className="px-4 md:px-14 lg:px-20 py-15 bg-white overflow-x-hidden">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-xl font-bold">
                <span className="mb-1 mr-1.5">Home</span> <FaAngleRight /> <span className="mb-1 mx-1.5">Category</span> <FaAngleRight /> <span className="mb-1 mx-1.5">{categoryName}</span>
            </div>

            <div className="flex flex-wrap text-sm md:text-base">
                <div onClick={() => selectCategory("")} className={`px-4 py-1.5 mr-2 md:mr-4 mb-3 text-center min-w-16 ${!id ? "text-white bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A]" : "text-[#F75E69] border-2 border-[#F75E69]"} rounded-full cursor-pointer`}>All</div>
                {categoryList.map((obj) => (
                    <div onClick={() => selectCategory(obj._id)} className={`px-4 py-1.5 mr-2 md:mr-4 mb-3 text-center min-w-16 ${id === obj._id ? "text-white bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A]" : "text-[#F75E69] border-2 border-[#F75E69]"} rounded-full cursor-pointer`}>{obj.category}</div>
                ))}
            </div>

            {loading ? (
                <div className="w-full h-[65vh] flex justify-center items-center">
                    <div className="loader">
                        <span className="loader-text">loading</span>
                        <span className="load"></span>
                    </div>
                </div>
            ) : (
                <div className="mt-6">
                    <div className="grid gap-6 md:gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-between">
                        {productList.map((product) => (
                            <Link to={`/product/${product._id}`} className='p-3 w-full min-w-[220px] bg-white rounded-xl shadow-[0px_15px_100px_0px_#9D9D9D40]'>
                                {product.imageUrls.length > 0 && product.imageUrls[0] ? (
                                        <img src={product.imageUrls[0]} className='h-[220px] w-full bg-[#D9D9D9] object-cover rounded'/>
                                    ) : (
                                        <div className='p-10 h-[220px] bg-[#D9D9D9] rounded'></div>
                                    )}
                                <div className='pt-3 text-left'>
                                    <div className='text-[#3B3B3B] text-[15px] leading-none break-words'>{product.product_name}</div>
                                    <div className='mt-1.5 text-[#7B7B7B] text-[13px] font-semibold'>{"Category > "} {categoryIdAndName[product.category_id]}</div>
                                    <div className='mt-4 flex justify-between items-center'>
                                        <div className='text-[#3B3B3B] text-lg font-semibold'>₹ {product.price}</div>
                                        <div className="px-5 py-1 bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:bg-gradient-to-br text-white text-sm rounded-full">Buy Now</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className='mt-10 w-full flex justify-center'>
                        <Pagination page={pages.currentPage} count={pages.totalPages} variant="outlined" shape="rounded" onChange={handlePagination} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllProducts