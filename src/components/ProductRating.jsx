import Rating from '@mui/material/Rating';

const ProductRating = ({ average, count }) => {
    const value = Number(average);
    const total = Number(count);
    if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(total) || total <= 0) return null;

    return (
        <div className="flex items-center gap-1 text-sm text-[#3B3B3B]" aria-label={`Average rating: ${value.toFixed(1)} out of 5 from ${total} ${total === 1 ? 'rating' : 'ratings'}`}>
            <Rating value={value} precision={0.1} readOnly size="small" sx={{ color: '#FFD119' }} />
            <span>({total})</span>
        </div>
    );
};

export default ProductRating;
