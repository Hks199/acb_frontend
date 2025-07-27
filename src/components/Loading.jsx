import React from 'react';

const Loading = () => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <div className="loader">
            <span className="loader-text">loading</span>
            <span className="load"></span>
        </div>
    </div>
  )
}

export default Loading
