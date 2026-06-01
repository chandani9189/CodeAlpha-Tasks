import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart, faShoppingCart, faTruck,
  faRotateLeft, faShield, faCheck,
  faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { addToCart, fetchCart } from '../redux/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice.js';
import API from '../services/api.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0); // current image index

  const inWishlist = wishlistItems?.some((item) =>
    (item._id || item) === id
  );

  const inCart = cartItems?.some((item) => {
    const cartProductId = item.product?._id || item.product;
    return cartProductId?.toString() === id;
  });

  useEffect(() => {
    fetchProduct();
    if (user) dispatch(fetchCart());
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      setSelectedSize(data.sizes?.[0] || '');
      setSelectedColor(data.colors?.[0] || '');
      setActiveImg(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    if (inCart) return;
    dispatch(addToCart({
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor,
    })).then(() => dispatch(fetchCart()));
  };

  const handleWishlist = () => {
    if (!user) return navigate('/login');
    if (inWishlist) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product._id));
  };

  // Get all images — use images array if available, fallback to single image
  const getAllImages = () => {
    if (product?.images?.length > 0) return product.images;
    if (product?.image) return [product.image];
    return [];
  };

  const prevImage = () => {
    const imgs = getAllImages();
    setActiveImg((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
  };

  const nextImage = () => {
    const imgs = getAllImages();
    setActiveImg((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Product not found</p>
    </div>
  );

  const allImages = getAllImages();

  return (
    <div className="min-h-screen bg-white px-8 py-6">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-600 hover:text-green-600 transition">
          &#8592;
        </button>
        <p className="text-sm text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-green-600">Home</button>
          <span className="mx-2">›</span>
          <button onClick={() => navigate(`/${product.category.toLowerCase()}`)} className="hover:text-green-600">
            {product.category}
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-600">{product.name}</span>
        </p>
      </div>

      <div className="flex gap-10">
        {/* Image Gallery */}
        <div className="w-96 flex-shrink-0">
          {/* Main image with arrows */}
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden h-96 group">
            <img
              src={allImages[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300"
            />

            {/* Arrows — only show if multiple images */}
            {allImages.length > 1 && (
              <>
                <button onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition">
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <button onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition">
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all ${
                        i === activeImg ? 'bg-green-600 w-4 h-2' : 'bg-white/70 w-2 h-2'
                      }`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                    i === activeImg
                      ? 'border-green-600 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  <img src={img} alt={`thumb-${i}`}
                    className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
            {product.category} — {product.subCategory}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Size: <span className="text-green-600">{selectedSize}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      selectedSize === size
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-600 hover:border-green-600'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="text-green-600">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      selectedColor === color
                        ? 'bg-green-50 border-green-600 text-green-600 font-medium'
                        : 'border-gray-300 text-gray-600 hover:border-green-600'
                    }`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-semibold text-gray-700">Quantity:</p>
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-500 hover:text-green-600 font-bold">−</button>
              <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="text-gray-500 hover:text-green-600 font-bold">+</button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={inCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                inCart
                  ? 'bg-green-100 text-green-700 border border-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}>
              <FontAwesomeIcon icon={inCart ? faCheck : faShoppingCart} />
              {inCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist}
              className={`px-4 py-3 rounded-xl border-2 transition ${
                inWishlist
                  ? 'border-red-400 text-red-500 bg-red-50'
                  : 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-400'
              }`}>
              <FontAwesomeIcon icon={inWishlist ? faHeart : faHeartRegular} />
            </button>
          </div>

          {/* Features */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            {[
              { icon: faTruck, text: 'Free delivery on orders above ₹300' },
              { icon: faRotateLeft, text: '7 days easy return policy' },
              { icon: faShield, text: '100% secure payment' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <FontAwesomeIcon icon={f.icon} className="text-green-600 w-4" />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}