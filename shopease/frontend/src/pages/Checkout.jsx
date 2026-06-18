import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faCreditCard, faShield,
  faPlus, faCheck, faTruck, faArrowLeft,
  faMobileAlt, faMoneyBillWave, faSpinner,
  faTimesCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { fetchCart } from '../redux/slices/cartSlice.js';
import API from '../services/api.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

const PAYMENT_METHODS = [
  { id: 'cod',  icon: faMoneyBillWave, label: 'Cash on Delivery',    desc: 'Pay when your order arrives',      color: 'text-yellow-600' },
  { id: 'upi',  icon: faMobileAlt,     label: 'UPI / QR Code',       desc: 'GPay, PhonePe, Paytm, BHIM',      color: 'text-purple-600' },
  { id: 'card', icon: faCreditCard,    label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay',          color: 'text-blue-600'   },
];

const EMPTY_ADDR = { fullName: '', phone: '', street: '', city: '', state: '', pincode: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCard   = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const fmtExpiry = (v) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length>=3?d.slice(0,2)+'/'+d.slice(2):d; };

// ─── Cancel Confirmation Modal ────────────────────────────────────────────────
function CancelModal({ orderId, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Cancel Order?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">
          Are you sure you want to cancel this order?
        </p>
        <p className="text-xs text-gray-400 text-center mb-5">
          Order ID: <span className="font-mono font-semibold text-gray-600">#{orderId?.slice(-8).toUpperCase()}</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Cancelling…</>
              : <><FontAwesomeIcon icon={faTimesCircle} /> Yes, Cancel</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);

  // ── UI state
  const [step,           setStep]           = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [pageLoading,    setPageLoading]    = useState(true);

  // ── Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddr,   setSelectedAddr]   = useState(null);
  const [showNewForm,    setShowNewForm]    = useState(false);
  const [addrForm,       setAddrForm]       = useState(EMPTY_ADDR);
  const [addrError,      setAddrError]      = useState('');

  // ── Payment state
  const [paymentMethod,  setPaymentMethod]  = useState('cod');
  const [upiId,          setUpiId]          = useState('');
  const [cardForm,       setCardForm]       = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [payError,       setPayError]       = useState('');

  // ── Order state
  const [orderPlaced,    setOrderPlaced]    = useState(false);
  const [orderId,        setOrderId]        = useState('');
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [showCancelModal,setShowCancelModal]= useState(false);
  const [cancelLoading,  setCancelLoading]  = useState(false);
  const [cancelError,    setCancelError]    = useState('');

  // ── Init
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([dispatch(fetchCart()), loadAddresses()]).finally(() => setPageLoading(false));
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data } = await API.get('/users/addresses');
      const list = data || [];
      setSavedAddresses(list);
      if (list.length > 0) setSelectedAddr(0);
      else setShowNewForm(true);
    } catch {
      setShowNewForm(true);
    }
  };

  // ── Prices
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const shipping  = subtotal >= 500 ? 0 : 50;
  const total     = subtotal + shipping;

  // ── Address handlers
  const handleAddrChange = (e) => {
    setAddrForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setAddrError('');
  };

  const handleSaveNewAddr = async () => {
    const { fullName, phone, street, city, pincode } = addrForm;
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setAddrError('Please fill all required (*) fields'); return;
    }
    if (!/^\d{6}$/.test(pincode)) { setAddrError('Pincode must be 6 digits'); return; }
    if (!/^\d{10}$/.test(phone.replace(/\D/g,''))) { setAddrError('Enter a valid 10-digit phone number'); return; }
    try {
      setLoading(true);
      const { data } = await API.post('/users/address', addrForm);
      setSavedAddresses(data);
      setSelectedAddr(data.length - 1);
      setShowNewForm(false);
      setAddrForm(EMPTY_ADDR);
      setAddrError('');
    } catch (err) {
      setAddrError(err.response?.data?.error || 'Could not save address. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Payment validation
  const validatePayment = () => {
    setPayError('');
    if (paymentMethod === 'upi') {
      if (!upiId.trim())                         { setPayError('Please enter your UPI ID'); return false; }
      if (!/^[\w.\-_]+@[\w]+$/.test(upiId.trim())) { setPayError('Invalid UPI ID — e.g. name@upi'); return false; }
    }
    if (paymentMethod === 'card') {
      const { number, name, expiry, cvv } = cardForm;
      if (!number || !name || !expiry || !cvv)   { setPayError('Please fill all card details'); return false; }
      if (number.replace(/\s/g,'').length < 16)  { setPayError('Card number must be 16 digits'); return false; }
      if (!/^\d{2}\/\d{2}$/.test(expiry))        { setPayError('Expiry format must be MM/YY'); return false; }
      if (cvv.length < 3)                        { setPayError('CVV must be 3–4 digits'); return false; }
    }
    return true;
  };

  // ── Place order
  const handlePlaceOrder = async () => {
    if (!validatePayment()) return;
    const addr = savedAddresses[selectedAddr];
    if (!addr) { setPayError('Please select a delivery address first!'); return; }

    setLoading(true);
    try {
      const { data } = await API.post('/orders/place', {
        shippingAddress: addr,
        paymentMethod,
        ...(paymentMethod === 'upi'  && { upiId }),
        ...(paymentMethod === 'card' && { cardLast4: cardForm.number.replace(/\s/g,'').slice(-4) }),
      });
      setOrderId(data._id);
      setOrderPlaced(true);
      // Clear cart locally then re-sync
      dispatch(fetchCart());
    } catch (err) {
      setPayError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel order
  const handleCancelOrder = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      await API.patch(`/orders/${orderId}/cancel`);
      setOrderCancelled(true);
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Could not cancel order. Try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const currentAddr = selectedAddr !== null && !showNewForm ? savedAddresses[selectedAddr] : null;

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE LOADING
  // ════════════════════════════════════════════════════════════════════════════
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="text-green-600 text-3xl animate-spin" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ORDER CANCELLED SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (orderCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Cancelled</h2>
          <p className="text-gray-500 text-sm mb-2">Your order has been successfully cancelled.</p>
          <p className="text-xs text-gray-400 mb-6">
            Order ID: <span className="font-mono font-semibold text-gray-700">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/account/orders')}
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ORDER SUCCESS SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (orderPlaced) {
    return (
      <>
        {showCancelModal && (
          <CancelModal
            orderId={orderId}
            onConfirm={handleCancelOrder}
            onClose={() => { setShowCancelModal(false); setCancelError(''); }}
            loading={cancelLoading}
          />
        )}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FontAwesomeIcon icon={faCheck} className="text-green-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm mb-2">Your order has been confirmed successfully.</p>
            <p className="text-xs text-gray-400 mb-1">
              Order ID: <span className="font-mono font-semibold text-gray-700">#{orderId.slice(-8).toUpperCase()}</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Payment: <span className="capitalize font-medium text-gray-600">{paymentMethod}</span>
            </p>

            {cancelError && (
              <p className="text-xs text-red-500 font-medium mb-3">{cancelError}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/account/orders')}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
              >
                Track My Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
              {/* Cancel Order */}
              <button
                onClick={() => { setCancelError(''); setShowCancelModal(true); }}
                className="w-full text-red-500 text-sm font-medium hover:underline pt-1 transition"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                Cancel This Order
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN CHECKOUT
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/cart')}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-green-600 hover:text-green-600 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
        {[{ n:1, label:'Delivery Address' },{ n:2, label:'Review & Pay' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= s.n ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s.n ? <FontAwesomeIcon icon={faCheck} /> : s.n}
            </div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-green-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i === 0 && <div className="w-12 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── LEFT ── */}
        <div className="flex-1 min-w-0">

          {/* ───── STEP 1: Address ───── */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-green-600" />
                Select Delivery Address
              </h3>

              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((addr, i) => (
                    <div
                      key={i}
                      onClick={() => { setSelectedAddr(i); setShowNewForm(false); }}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                        selectedAddr === i && !showNewForm
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedAddr === i && !showNewForm
                            ? 'border-green-600 bg-green-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedAddr === i && !showNewForm && (
                            <FontAwesomeIcon icon={faCheck} className="text-white text-[8px]" />
                          )}
                        </div>
                        <div className="text-sm min-w-0">
                          <p className="font-semibold text-gray-900">{addr.fullName}</p>
                          <p className="text-gray-500 mt-0.5">{addr.street}</p>
                          <p className="text-gray-500">
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                          </p>
                          {addr.phone && <p className="text-gray-400 text-xs mt-0.5">{addr.phone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New address form */}
              {!showNewForm ? (
                <button
                  onClick={() => { setShowNewForm(true); setSelectedAddr(null); setAddrError(''); }}
                  className="flex items-center gap-2 text-sm text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add New Address
                </button>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">New Delivery Address</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name:'fullName', label:'Full Name *',  placeholder:'Enter full name',     col:1 },
                      { name:'phone',    label:'Phone *',      placeholder:'10-digit mobile no.', col:1 },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
                        <input
                          name={f.name} value={addrForm[f.name]}
                          onChange={handleAddrChange} placeholder={f.placeholder}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Street Address *</label>
                      <input
                        name="street" value={addrForm.street}
                        onChange={handleAddrChange} placeholder="House no, Street, Area"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                      <input
                        name="city" value={addrForm.city}
                        onChange={handleAddrChange} placeholder="City"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                      <select
                        name="state" value={addrForm.state} onChange={handleAddrChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      >
                        <option value="">Select State</option>
                        {STATES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                      <input
                        name="pincode" value={addrForm.pincode}
                        onChange={handleAddrChange} placeholder="400001"
                        maxLength={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  {addrError && (
                    <p className="mt-3 text-xs text-red-500 font-medium">{addrError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={handleSaveNewAddr}
                      disabled={loading}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                      Save & Use This Address
                    </button>
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => { setShowNewForm(false); setSelectedAddr(0); setAddrError(''); }}
                        className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!showNewForm && selectedAddr !== null && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
                >
                  Continue to Review →
                </button>
              )}
            </div>
          )}

          {/* ───── STEP 2: Review & Pay ───── */}
          {step === 2 && (
            <div className="space-y-4">

              {/* Delivering to */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex justify-between items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLocationDot} className="text-green-600" />
                    Delivering To
                  </h3>
                  <button onClick={() => setStep(1)} className="text-xs text-green-600 hover:underline">Change</button>
                </div>
                {savedAddresses[selectedAddr] && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-gray-900">{savedAddresses[selectedAddr].fullName}</p>
                    <p>{savedAddresses[selectedAddr].street}</p>
                    <p>
                      {savedAddresses[selectedAddr].city}
                      {savedAddresses[selectedAddr].state ? `, ${savedAddresses[selectedAddr].state}` : ''}
                      {' '}— {savedAddresses[selectedAddr].pincode}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{savedAddresses[selectedAddr].phone}</p>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Items ({items.length})</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4">
                        <img
                          src={item.product?.image} alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                          onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{item.product?.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.size  && `Size: ${item.size}`}
                            {item.color && ` | Color: ${item.color}`}
                            {` | Qty: ${item.quantity}`}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          ₹{((item.product?.price || 0) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCreditCard} className="text-green-600" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => { setPaymentMethod(pm.id); setPayError(''); }}
                      className={`border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition ${
                        paymentMethod === pm.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === pm.id ? 'border-green-600 bg-green-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === pm.id && (
                          <FontAwesomeIcon icon={faCheck} className="text-white text-[8px]" />
                        )}
                      </div>
                      <FontAwesomeIcon icon={pm.icon} className={`${pm.color} text-lg`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* UPI input */}
                {paymentMethod === 'upi' && (
                  <div className="mt-4 border border-gray-200 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Enter UPI ID *</label>
                    <input
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setPayError(''); }}
                      placeholder="yourname@upi"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">e.g. 9876543210@paytm, name@gpay</p>
                  </div>
                )}

                {/* Card input */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Card Number *</label>
                        <input
                          value={cardForm.number}
                          onChange={(e) => { setCardForm((p) => ({ ...p, number: fmtCard(e.target.value) })); setPayError(''); }}
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 font-mono tracking-widest"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Name on Card *</label>
                        <input
                          value={cardForm.name}
                          onChange={(e) => { setCardForm((p) => ({ ...p, name: e.target.value })); setPayError(''); }}
                          placeholder="As printed on card"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Expiry *</label>
                        <input
                          value={cardForm.expiry}
                          onChange={(e) => { setCardForm((p) => ({ ...p, expiry: fmtExpiry(e.target.value) })); setPayError(''); }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">CVV *</label>
                        <input
                          value={cardForm.cvv}
                          onChange={(e) => { setCardForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })); setPayError(''); }}
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payError && (
                  <p className="mt-3 text-xs text-red-500 font-medium">{payError}</p>
                )}
              </div>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-base transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Processing your order…</>
                  : <><FontAwesomeIcon icon={faCheck} /> Place Order — ₹{total.toFixed(0)}</>
                }
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                <FontAwesomeIcon icon={faShield} className="text-green-600" />
                Safe &amp; Secure Checkout
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Sidebar ── */}
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-32">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

            {/* Address preview in sidebar */}
            {currentAddr && (
              <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faLocationDot} /> Delivering To
                </p>
                <p className="text-xs font-semibold text-gray-800">{currentAddr.fullName}</p>
                <p className="text-xs text-gray-500">{currentAddr.street}</p>
                <p className="text-xs text-gray-500">
                  {currentAddr.city}{currentAddr.state ? `, ${currentAddr.state}` : ''} — {currentAddr.pincode}
                </p>
              </div>
            )}

            {/* Prices */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-gray-900">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">₹{total.toFixed(0)}</span>
            </div>

            {shipping > 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faTruck} className="text-green-600 text-sm" />
                <p className="text-xs text-gray-600">
                  Add <span className="text-green-600 font-semibold">₹{(500 - subtotal).toFixed(0)}</span> more for free shipping!
                </p>
              </div>
            )}

            {/* Cart preview */}
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
              {items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <img
                    src={item.product?.image} alt=""
                    className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    ₹{(item.product?.price || 0) * item.quantity}
                  </p>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-gray-400 text-center">+{items.length - 3} more items</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
