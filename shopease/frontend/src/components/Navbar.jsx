import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart, faUser, faMagnifyingGlass, faTruck } from '@fortawesome/free-solid-svg-icons';
import { fetchCart } from '../redux/slices/cartSlice.js';
import { fetchWishlist } from '../redux/slices/wishlistSlice.js';

const CATS = [
  { cat: 'topwear',     words: ['topwear','shirt','shirts','tshirt','t-shirt','kurta','blouse','top'] },
  { cat: 'bottomwear',  words: ['bottomwear','jeans','pant','pants','trouser','trousers','legging','leggings','skirt'] },
  { cat: 'footwear',    words: ['footwear','shoes','shoe','sandal','sandals','sneaker','sneakers','boot','boots','slipper','slippers'] },
  { cat: 'accessories', words: ['accessories','bag','bags','belt','belts','watch','watches','jewellery','jewelry','cap','caps','wallet'] },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems }     = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [search,       setSearch]       = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setShowDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q  = search.trim();
    if (!q) return;

    const lq = q.toLowerCase();

    // Pure gender
    if (lq === 'men' || lq === 'man')         { navigate('/men');   return; }
    if (lq === 'women' || lq === 'woman')      { navigate('/women'); return; }

    const isMen   = lq.includes('men') && !lq.includes('women');
    const isWomen = lq.includes('women') || lq.includes('woman');
    const matched = CATS.find(({ words }) => words.some((w) => lq.includes(w)));

    if (matched && isMen)   { navigate(`/men?category=${matched.cat}`);                                    return; }
    if (matched && isWomen) { navigate(`/women?category=${matched.cat}`);                                  return; }
    if (matched)            { navigate(`/search?q=${encodeURIComponent(q)}&category=${matched.cat}`);      return; }
    if (isMen)              { navigate('/men');                                                             return; }
    if (isWomen)            { navigate('/women');                                                           return; }

    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const navLinks = [
    { path: '/',      label: 'Home'   },
    { path: '/men',   label: 'Men'    },
    { path: '/women', label: 'Women'  },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}

      {/* Top bar */}
      <div className="bg-gray-900 text-white text-xs px-8 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faTruck} />
          <span>Free shipping on orders over ₹300</span>
        </div>
        <div className="flex gap-4">
          <Link to="/help" className="hover:text-green-400">Help &amp; Support</Link>
          <span className="text-gray-500">|</span>
          <Link to="/track-order" className="hover:text-green-400">Track Order</Link>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-white px-8 py-4 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 text-2xl font-bold flex-shrink-0 mr-2">
          <div className="bg-green-600 text-white p-1.5 rounded-md">
            <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
          </div>
          <span className="text-gray-900">Shop</span>
          <span className="text-green-600">Ease</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search products, e.g. men shirts, women shoes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-600"
          />
          <button type="submit" className="bg-green-600 px-5 py-2.5 text-white hover:bg-green-700 transition">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-7 ml-2">

          {/* Account */}
          <div className="relative z-50">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 text-gray-600 hover:text-green-600 transition">
              <FontAwesomeIcon icon={faUser} className="text-xl text-gray-500" />
              <div className="text-left">
                <p className="text-xs text-gray-400 leading-none">Account</p>
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user ? user.name.split(' ')[0] : 'Sign in'}
                </p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-lg w-44 z-50">
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                      My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-green-600 hover:bg-gray-50">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 rounded-b-xl">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="flex items-center gap-2.5 text-gray-600 hover:text-green-600 transition">
            <div className="relative">
              <FontAwesomeIcon icon={faHeart} className="text-xl text-gray-500" />
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {wishlistItems?.length || 0}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 leading-none">My</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Wishlist</p>
            </div>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2.5 text-gray-600 hover:text-green-600 transition">
            <div className="relative">
              <FontAwesomeIcon icon={faShoppingCart} className="text-xl text-gray-500" />
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartItems?.length || 0}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 leading-none">My</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Cart</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Nav links — same as original */}
      <div className="bg-white px-8 flex gap-8 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`py-3 font-medium border-b-2 transition ${
              location.pathname === link.path
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-700 hover:text-green-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}