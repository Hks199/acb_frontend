const InfoComponent = () => {
  return (
    <div className="w-[43%] bg-gradient-to-r from-[#FF5E5E] to-[#FA1A8A] text-white hidden md:flex flex-col justify-center items-center rounded-xl">
        <div className='w-[70%]'>
            <h1 className="text-3xl font-bold mb-10 leading-tight">
            Step Back Into Handmade Beauty
            </h1>
            <ul className="list-disc ml-5 space-y-4">
            <li>Rediscover unique, artisan-crafted pieces made with passion and care.</li>
            <li>Log in to view your favorites, explore new arrivals, and track your orders.</li>
            <li>Enjoy a personalized experience tailored to your style and creative journey.</li>
            <li>Dive back into a world of handmade art, crafted by skilled hands.</li>
            </ul>
        </div>
      </div>
  )
}

export default InfoComponent