import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice.js';
import { addToCart, fetchCart } from '../redux/slices/cartSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faShoppingCart, faHeart, faCheck,
  faTruck, faRotateLeft, faLock, faHeadset
} from '@fortawesome/free-solid-svg-icons';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    dispatch(fetchWishlist());
    dispatch(fetchCart());
  }, [user]);

  const isInCart = (productId) => {
    return cartItems?.some((item) => {
      const id = item.product?._id || item.product || item._id || item.productId;
      return id?.toString() === productId?.toString();
    });
  };

  const handleAddToCart = async (product) => {
    if (isInCart(product._id)) return;
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
    await dispatch(addToCart({
      productId: product._id,
      quantity: 1,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || '',
    }));
    dispatch(fetchCart());
  };

  const handleMoveAll = () => {
    items.forEach((product) => handleAddToCart(product));
  };

  const handleRemove = async () => {
    setDeleteLoading(true);
    await dispatch(removeFromWishlist(deleteId));
    setDeleteId(null);
    setDeleteLoading(false);
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Wishlist ({items.length})
          </h1>
          <p className="text-sm text-gray-400 mt-1">Items you love. Don't miss out!</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleMoveAll}
            className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition">
            <FontAwesomeIcon icon={faShoppingCart} />
            Move All to Cart
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FontAwesomeIcon icon={faHeart} className="text-5xl mb-4 text-gray-200" />
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm mt-1">Save items you love to your wishlist</p>
          <Link to="/" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((product) => {
            const inCart = isInCart(product._id);
            const adding = addingToCart[product._id];
            return (
              <div key={product._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                {/* Image */}
                <img src={product.image} alt={product.name}
                  className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl bg-gray-50 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 cursor-pointer hover:text-green-600 transition"
                    onClick={() => navigate(`/product/${product._id}`)}>
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {product.colors?.[0] && `Color: ${product.colors[0]}`}
                    {product.sizes?.[0] && ` | Size: ${product.sizes[0]}`}
                  </p>
                </div>

                {/* Price */}
                <div className="sm:text-right sm:mr-8">
                  <p className="font-bold text-gray-900">₹{product.price}</p>
                  {product.originalPrice > product.price && (
                    <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
                  )}
                  <p className="text-xs text-green-600 mt-0.5">In Stock</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={inCart || adding}
                    className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      inCart
                        ? 'bg-green-100 text-green-600 border border-green-400 opacity-60 cursor-not-allowed'
                        : 'border border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={inCart ? faCheck : faShoppingCart} />
                    {inCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => setDeleteId(product._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Features — with icons like Home page */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-gray-200 rounded-xl mt-10 overflow-hidden">
          {[
            { icon: faTruck, title: 'Free Shipping', desc: 'On orders over ₹300' },
            { icon: faRotateLeft, title: 'Easy Returns', desc: '7 days return policy' },
            { icon: faLock, title: 'Secure Payment', desc: '100% secure payment' },
            { icon: faHeadset, title: '24/7 Support', desc: 'Dedicated support' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-4 px-6 border-b sm:border-r border-gray-200 last:border-b-0">
              <div className="bg-green-50 p-2.5 rounded-full flex-shrink-0">
                <FontAwesomeIcon icon={f.icon} className="text-green-600 text-sm" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-4">
              <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            </div>
            <h3 className="text-center font-bold text-gray-900 text-lg">Remove from Wishlist?</h3>
            <p className="text-center text-sm text-gray-500 mt-2">
              Are you sure you want to remove this item from your wishlist?
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleRemove} disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
                {deleteLoading ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
