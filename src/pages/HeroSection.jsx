import { Link, useNavigate } from "react-router";
import { getAllVendors } from "../api/vendor";
import { useEffect, useState } from "react";

export default function HeroSection({ products = [], totalProducts }) {
  const navigate = useNavigate();
  const [totalVendors, setTotalVendors] = useState(20);

  const fetchAllVendors = async (pageNum) => {
    const reqBody = { page:pageNum, limit:5 }
  
    try{
        const resp = await getAllVendors(reqBody);
        if(resp && resp.data && resp.data.success){
          if(resp?.data?.total){
            setTotalVendors(resp?.data?.total);
          }
        }
    }
    catch(err){}
  }

  useEffect(() => {
    fetchAllVendors(1);
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden z-10">
      {/* Hero Section */}
      <section className="relative md:pt-16 md:pb-20 sm:pb-24 lg:pt-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid max-w-2xl grid-cols-1 items-center h-screen md:h-auto mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-16">
            
            {/* Left Content */}
            <div className="pl-0 md:pl-6 relative z-10">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A]">Handmade Art</span> <br />
                  & Craft for Your Home
                </h1>
                <p className="mt-4 text-lg text-gray-700 sm:mt-8">
                  Timeless, handcrafted art and craft pieces that add{" "}
                  <span className="font-semibold text-[#FF5E5E]">warmth</span>,{" "}
                  <span className="font-semibold text-[#FFC336]">beauty</span>, 
                  and{" "}
                  <span className="font-semibold text-[#7A38FF]">story</span>{" "}
                  to your everyday spaces.
                </p>

                {/* CTA */}
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center sm:space-x-5 justify-center lg:justify-start">
                  <button onClick={() => navigate("/products")}
                    className="px-8 py-4 text-lg font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] hover:from-[#FA1A8A] hover:to-[#FF5E5E] transition-all"
                  >
                    Shop Now
                  </button>
                  <button onClick={() => navigate("/art-gallery")}
                    className="mt-4 sm:mt-0 px-8 py-4 text-lg font-bold text-gray-900 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition-all"
                  >
                    Explore Our Gallery
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center mt-12 space-x-6 lg:justify-start sm:space-x-12">
                <div className="w-[35%] sm:w-auto text-center">
                  <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    {Math.floor(totalProducts / 10) * 10}+
                  </p>
                  <p className="mt-1 text-sm md:text-base text-gray-600">Handmade Pieces</p>
                </div>

                <div className="block h-10 w-px bg-gray-300"></div>

                <div className="w-[35%] sm:w-auto text-center">
                  <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    {Math.floor(totalVendors / 10) * 10}+
                  </p>
                  <p className="mt-1 text-sm md:text-base text-gray-600">Skilled Creators</p>
                </div>
              </div>
            </div>

            {/* Right Side Illustration / Image */}
            <div className="relative w-full hidden md:flex justify-center h-[450px] scale-[90%]">
                {products.slice(0, 3).map((obj, i) => (
                    <div
                    key={obj._id}
                    className={`absolute bg-white rounded-2xl shadow-xl p-3 w-[250px] hover:scale-105 transition
                        ${i === 0 ? "top-0 left-12 rotate-[-3deg] z-20" : ""}
                        ${i === 1 ? "top-16 left-58 rotate-[5deg] z-10" : ""}
                        ${i === 2 ? "top-38 left-30 rotate-[-5deg] z-0" : ""}`}
                    >
                    {obj.imageUrls?.[0] ? (
                        <img
                        src={obj.imageUrls[0]}
                        alt={obj.product_name}
                        className="h-[200px] w-full object-cover rounded-xl"
                        />
                    ) : (
                        <div className="h-[200px] w-full bg-gray-200 rounded-xl"></div>
                    )}
                    <div className="pt-3">
                        <h4 className="text-lg font-semibold text-gray-800 truncate">
                        {obj.product_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                        {obj.categoryName || "Art & Craft"}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">₹ {obj.price}</span>
                        <Link
                            to={`/product/${obj._id}`}
                            className="px-3 py-1 text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700"
                        >
                            Buy
                        </Link>
                        </div>
                    </div>
                    </div>
                ))}
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
