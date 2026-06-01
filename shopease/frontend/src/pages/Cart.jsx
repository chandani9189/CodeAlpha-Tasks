import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, updateQuantity, optimisticUpdate } from '../redux/slices/cartSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faShoppingCart,
  faTruck, faRotateLeft, faLock, faHeadset
} from '@fortawesome/free-solid-svg-icons';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    dispatch(fetchCart());
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 300 ? 0 : 50;
  const total = subtotal + shipping;
  const freeShippingLeft = Math.max(0, 300 - subtotal);

  const handleRemove = (itemId) => dispatch(removeFromCart(itemId));

  // Optimistic update — change quantity in Redux immediately, then sync backend
  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    // Update Redux state immediately (no loading screen)
    dispatch({
      type: 'cart/optimisticUpdate',
      payload: { itemId: item._id, quantity: newQty },
    });
    // Sync with backend silently
    dispatch(updateQuantity({ itemId: item._id, quantity: newQty }));
  };

  return (
    <div className="min-h-screen bg-white px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>

      {loading && items.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading cart...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FontAwesomeIcon icon={faShoppingCart} className="text-5xl mb-4 text-gray-200" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm mt-1">Add items to your cart to checkout</p>
          <Link to="/" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="grid grid-cols-4 text-sm text-gray-500 pb-3 border-b border-gray-100">
              <p>Product</p>
              <p className="text-center">Price</p>
              <p className="text-center">Quantity</p>
              <p className="text-right">Subtotal</p>
            </div>

            <div className="space-y-4 mt-4">
              {items.map((item) => (
                <div key={item._id} className="grid grid-cols-4 items-center py-4 border-b border-gray-100">
                  {/* Product */}
                  <div className="flex items-center gap-4">
                    <img src={item.product?.image} alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-50" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.product?.name}</p>
                      {item.color && <p className="text-xs text-gray-400 mt-0.5">Color: {item.color}</p>}
                      {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                      <button onClick={() => handleRemove(item._id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mt-1 transition">
                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-center font-medium text-gray-900">₹{item.product?.price}</p>

                  {/* Quantity — instant update, no loading */}
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleQuantity(item, -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600 transition text-sm">
                      −
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item, +1)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600 transition text-sm">
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-right font-bold text-gray-900">
                    ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Link to="/" className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-green-600 hover:text-green-600 transition">
                ← Continue Shopping
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-4 border border-gray-200 rounded-xl mt-8 overflow-hidden">
              {[
                { icon: faTruck, title: 'Free Shipping', desc: 'On orders over ₹300' },
                { icon: faRotateLeft, title: 'Easy Returns', desc: '7 days return policy' },
                { icon: faLock, title: 'Secure Payment', desc: '100% secure payment' },
                { icon: faHeadset, title: '24/7 Support', desc: 'Dedicated support' },
              ].map((f, i) => (
                <div key={i} className={`flex items-center gap-3 py-4 px-4 ${i < 3 ? 'border-r border-gray-200' : ''}`}>
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
          </div>

          {/* Order Summary */}
          <div className="w-72 flex-shrink-0">
            <div className="border border-gray-200 rounded-xl p-5 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Each product price breakdown */}
              <div className="space-y-2 mb-3">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[140px]">
                      {item.product?.name}
                      <span className="text-gray-400 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 flex-shrink-0">
                      ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">₹{total.toFixed(2)}</span>
              </div>

              {/* Shipping message */}
              {freeShippingLeft > 0 ? (
                <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruck} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    Add <span className="text-green-600 font-semibold">₹{freeShippingLeft.toFixed(2)}</span> more for <span className="text-green-600 font-semibold">FREE shipping!</span>
                  </p>
                </div>
              ) : (
                <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruck} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-600 font-semibold">🎉 You've got FREE shipping!</p>
                </div>
              )}
              <button onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-4 transition">
                  Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}