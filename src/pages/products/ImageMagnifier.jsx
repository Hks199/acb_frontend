/*import React, { useRef, useState } from 'react';
import './ImageMagnifier.css';

const ImageMagnifier = ({ src, zoom = 2, width = 400, height = 400 }) => {
  const containerRef = useRef(null);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div className="magnifier-wrapper">
      <div
        className="image-container"
        style={{ width, height }}
        ref={containerRef}
        onMouseEnter={() => setShowZoom(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowZoom(false)}
      >
        <img
          src={src}
          alt="zoom"
          className="product-image"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {showZoom && (
        <div
          className="zoom-preview"
          style={{
            width,
            height,
            backgroundImage: `url(${src})`,
            backgroundPosition,
            backgroundSize: `${zoom * 100}%`,
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
*/
import React, { useRef, useState } from 'react';
import './ImageMagnifier.css';

const ImageMagnifier = ({ src, zoom = 2, width = 400, height = 400 }) => {
  const imageRef = useRef(null);
  const [backgroundPosition, setBackgroundPosition] = useState('50% 50%');
  const [isZoomed, setIsZoomed] = useState(false);

  const wid = `w-[${width}]`

  const handleMouseMove = (e) => {
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div
      ref={imageRef}
      className={`zoom-in-image rounded w-full md:${wid}`}
      style={{
        // width,
        height,
        backgroundImage: `url("${src}")`,
        backgroundSize: isZoomed ? `${zoom * 100}%` : 'cover',
        backgroundPosition: backgroundPosition,
        // backgroundSize:'contain',
        // backgroundRepeat:"no-repeat"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    />
  );
};

export default ImageMagnifier;
