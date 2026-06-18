import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loginUser } from '../redux/slices/authSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faBoxOpen, faHeart, faLocationDot,
  faUser, faLock, faRightFromBracket, faHeadset,
  faShield, faPen, faChevronRight, faPlus,
  faTrash, faCheck, faXmark
} from '@fortawesome/free-solid-svg-icons';
import API from '../services/api.js';
import MyOrders from './MyOrders.jsx';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: faHouse },
  { key: 'orders', label: 'My Orders', icon: faBoxOpen },
  { key: 'wishlist', label: 'Wishlist', icon: faHeart },
  { key: 'addresses', label: 'Addresses', icon: faLocationDot },
  { key: 'profile', label: 'Profile Details', icon: faUser },
  { key: 'password', label: 'Change Password', icon: faLock },
];

export default function Account() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const getInitialTab = () => {
    if (location.pathname === '/account/orders') return 'orders';
    return searchParams.get('tab') || 'dashboard';
  };

  const [active, setActive] = useState(getInitialTab);
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', pincode: '',
  });
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
    fetchWishlist();
    fetchAddresses(); 
    setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/my');
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const fetchAddresses = async () => {
  try {
    const { data } = await API.get('/users/addresses');
    setAddresses(data || []);
  } catch (err) {
    console.error(err);
  }
};

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/wishlist');
      setWishlistCount(data.items?.length || 0);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Save profile
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await API.put('/users/profile', profileForm);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Add address
  const handleAddAddress = async () => {
    if (!addressForm.fullName || !addressForm.street || !addressForm.city || !addressForm.pincode)
      return alert('Please fill all required fields!');
    setAddressLoading(true);
    try {
      const { data } = await API.post('/users/address', addressForm);
      setAddresses(data);
      setShowAddForm(false);
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (index) => {
    try {
      const { data } = await API.delete(`/users/address/${index}`);
      setAddresses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (status) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-600';
    if (status === 'Processing') return 'bg-yellow-100 text-yellow-600';
    if (status === 'Shipped') return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 lg:flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Account Menu</p>
            </div>
            <ul>
              {menuItems.map((item) => (
                <li key={item.key}>
                  <button onClick={() => setActive(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${
                      active === item.key
                        ? 'bg-green-50 text-green-600 font-semibold border-l-4 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}>
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 border-l-4 border-transparent transition">
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-800 text-sm mb-1">Need Help?</p>
            <p className="text-xs text-gray-400 mb-3">Feel free to contact our support team.</p>
            <button className="w-full border border-green-600 text-green-600 text-xs py-2 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faHeadset} /> Contact Support
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span className="mx-2">›</span>
            <span>My Account</span>
          </p>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
          <p className="text-sm text-gray-400 mb-6">Manage your profile, orders and more.</p>

          {/* Dashboard */}
          {active === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: faBoxOpen, label: 'Total Orders', value: orders.length, link: 'View all orders', key: 'orders', bg: 'bg-green-50', color: 'text-green-600' },
                  { icon: faHeart, label: 'Wishlist Items', value: wishlistCount, link: 'View wishlist', key: 'wishlist', bg: 'bg-pink-50', color: 'text-pink-500' },
                  { icon: faLocationDot, label: 'Saved Addresses', value: addresses.length, link: 'Manage addresses', key: 'addresses', bg: 'bg-blue-50', color: 'text-blue-500' },
                  { icon: faUser, label: 'Account Type', value: user?.role === 'admin' ? 'Admin' : 'User', link: 'Personal Account', key: 'profile', bg: 'bg-purple-50', color: 'text-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className={`${stat.bg} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
                      <FontAwesomeIcon icon={stat.icon} className={stat.color} />
                    </div>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                    <button onClick={() => setActive(stat.key)} className="text-xs text-green-600 hover:underline mt-1">
                      {stat.link}
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActive('orders')} className="text-green-600 text-xs hover:underline">View All</button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 4).map((order) => (
                        <button key={order._id} onClick={() => setActive('orders')}
                          className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition">
                          <img src={order.items?.[0]?.product?.image} alt=""
                            className="w-12 h-12 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="text-sm font-bold text-gray-900">₹{order.totalAmount}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Profile Summary</h3>
                    <button onClick={() => setActive('profile')} className="text-green-600 text-xs hover:underline flex items-center gap-1">
                      <FontAwesomeIcon icon={faPen} className="text-[10px]" /> Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">{user?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                      {user?.phone && <p className="text-sm text-gray-400">{user?.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member Since</span>
                      <span className="font-medium text-gray-700">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Type</span>
                      <span className="font-medium text-gray-700 capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {menuItems.map((item) => (
                    <button key={item.key} onClick={() => setActive(item.key)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition">
                      <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={item.icon} className="text-gray-600" />
                      </div>
                      <p className="text-xs text-gray-600 text-center">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
                <FontAwesomeIcon icon={faShield} className="text-green-600" />
                Your account is secure and your data is safe with us.
              </div>
            </div>
          )}

          {active === 'orders' && <MyOrders />}

          {/* Profile Details */}
          {active === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-5">Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                  <input value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                  <input value={user?.email} disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                  <input value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Address section inside profile */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="font-semibold text-gray-800 mb-3">Saved Addresses</h4>
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-400">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {addresses.map((addr, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-3 flex gap-3 justify-between items-start">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-800">{addr.fullName}</p>
                          <p>{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
                          {addr.phone && <p>{addr.phone}</p>}
                        </div>
                        <button onClick={() => handleDeleteAddress(i)} className="text-red-400 hover:text-red-600 ml-3">
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setActive('addresses'); setShowAddForm(true); }}
                  className="mt-2 flex items-center gap-1.5 text-sm text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition">
                  <FontAwesomeIcon icon={faPlus} /> Add New Address
                </button>
              </div>

              <button onClick={handleSaveProfile} disabled={profileLoading}
                className={`mt-6 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition ${
                  profileSaved ? 'bg-green-100 text-green-700' : 'bg-green-600 text-white hover:bg-green-700'
                }`}>
                <FontAwesomeIcon icon={profileSaved ? faCheck : faPen} />
                {profileLoading ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {active === 'password' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                    <input type="password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>
                ))}
                <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {active === 'wishlist' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">My Wishlist</h3>
              <Link to="/wishlist" className="text-green-600 text-sm hover:underline flex items-center gap-1">
                View Full Wishlist <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </Link>
            </div>
          )}

          {/* Addresses Tab */}
          {active === 'addresses' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900">Saved Addresses ({addresses.length})</h3>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                  <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
                  {showAddForm ? 'Cancel' : 'Add New Address'}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddForm && (
                <div className="border border-green-100 bg-green-50 rounded-xl p-4 mb-5">
                  <h4 className="font-semibold text-gray-800 mb-4 text-sm">New Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                      <input value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        placeholder="Enter full name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
                      <input value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Street Address *</label>
                      <input value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="House no, Street, Area"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                      <input value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="City"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                      <input value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                      <input value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="400001"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 bg-white" />
                    </div>
                  </div>
                  <button onClick={handleAddAddress} disabled={addressLoading}
                    className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50">
                    {addressLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FontAwesomeIcon icon={faLocationDot} className="text-4xl mb-3 text-gray-200" />
                  <p className="font-medium">No addresses saved</p>
                  <p className="text-sm mt-1">Add a delivery address to checkout faster</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 flex gap-3 justify-between items-start hover:shadow-sm transition">
                      <div className="flex gap-3">
                        <div className="bg-green-50 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FontAwesomeIcon icon={faLocationDot} className="text-green-600 text-sm" />
                        </div>
                        <div className="text-sm min-w-0">
                          <p className="font-semibold text-gray-900">{addr.fullName}</p>
                          <p className="text-gray-500 mt-0.5">{addr.street}</p>
                          <p className="text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode}</p>
                          {addr.phone && <p className="text-gray-400 text-xs mt-0.5">{addr.phone}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAddress(i)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition ml-3">
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
