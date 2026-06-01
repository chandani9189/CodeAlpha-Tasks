import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice.js';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const inWishlist = wishlistItems?.some((item) =>
    (item._id || item) === product._id
  );

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (inWishlist) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product));
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer"
    >
      {/* Wishlist button */}
      <button onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow-sm hover:scale-110 transition">
        <FontAwesomeIcon
          icon={inWishlist ? faHeart : faHeartRegular}
          className={inWishlist ? 'text-red-500' : 'text-gray-400'}
        />
      </button>

      {/* Discount badge */}
      {product.discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {product.discount}% OFF
        </div>
      )}

      {/* Image */}
      <div className="bg-gray-50 h-56 overflow-hidden">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.subCategory}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-base font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        {/* Hover hint */}
        <p className="text-[15px] text-gray-400 mt-1 group-hover:text-green-600 transition">
          Click to view details →
        </p>
      </div>
    </div>
  );
}