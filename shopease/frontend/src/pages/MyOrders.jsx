import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen, faChevronRight, faChevronLeft,
  faTruck, faCircleCheck, faSpinner, faLocationDot,
  faXmark, faBox, faBoxesPacking, faBan
} from '@fortawesome/free-solid-svg-icons';
import API from '../services/api.js';

// 4 step progress
const steps = [
  { key: 'Processing', label: 'Order Received', icon: faBoxOpen },
  { key: 'Packed',     label: 'Packed',         icon: faBoxesPacking },
  { key: 'Shipped',    label: 'Shipped',         icon: faTruck },
  { key: 'Delivered',  label: 'Delivered',       icon: faCircleCheck },
];

const statusConfig = {
  Processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  Packed:     { label: 'Packed',     color: 'bg-blue-100 text-blue-700' },
  Shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-700' },
  Delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700' },
  Cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700' },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    API.get('/orders/my')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await API.put(`/orders/status/${selectedOrder._id}`, { status: 'Cancelled' });
      const updated = { ...selectedOrder, status: 'Cancelled' };
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => o._id === updated._id ? updated : o));
      setShowCancelConfirm(false);
    } catch (err) {
      alert('Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const stepIndex = (status) => steps.findIndex((s) => s.key === status);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <p className="text-gray-400 text-sm">Loading orders...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
      <FontAwesomeIcon icon={faBoxOpen} className="text-4xl mb-3 text-gray-200" />
      <p className="font-medium">No orders yet</p>
      <p className="text-sm mt-1">Start shopping to see your orders here</p>
      <button onClick={() => navigate('/')}
        className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 transition">
        Shop Now
      </button>
    </div>
  );

  // Order Detail View
  if (selectedOrder) {
    const s = statusConfig[selectedOrder.status] || statusConfig.Processing;
    const idx = stepIndex(selectedOrder.status);
    const isCancelled = selectedOrder.status === 'Cancelled';
    const canCancel = !isCancelled && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Shipped';

    return (
      <div>
        {/* Back button */}
        <button onClick={() => { setSelectedOrder(null); setShowCancelConfirm(false); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 mb-5 transition">
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          Back to Orders
        </button>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-5 py-4 flex justify-between items-center flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="font-mono font-semibold text-gray-800 text-sm">
                #{selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Placed On</p>
              <p className="text-sm font-medium text-gray-800">{fmt(selectedOrder.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm font-bold text-gray-900">₹{selectedOrder.totalAmount}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${s.color}`}>
              {s.label}
            </span>
          </div>

          {/* Progress tracker */}
          {!isCancelled ? (
            <div className="px-6 py-6 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-5">Order Progress</p>
              <div className="flex items-start">
                {steps.map((step, i) => {
                  const done = i <= idx;
                  const active = i === idx;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        {/* Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                          done
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-200 text-gray-400'
                        } ${active ? 'ring-4 ring-green-100' : ''}`}>
                          <FontAwesomeIcon icon={step.icon} className="text-sm" />
                        </div>
                        {/* Label */}
                        <p className={`text-[11px] mt-2 font-medium text-center leading-tight max-w-[64px] ${
                          done ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      {/* Line */}
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 rounded-full mb-5 transition-all ${
                          i < idx ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faBan} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm">Order Cancelled</p>
                <p className="text-xs text-gray-400 mt-0.5">This order has been cancelled</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</p>
            <div className="space-y-3">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img src={item.product?.image} alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.product?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`}
                      {item.color && ` | Color: ${item.color}`}
                      {` | Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {selectedOrder.shippingAddress && (
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-green-600" />
                Shipping Address
              </p>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-800">{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}{selectedOrder.shippingAddress.state ? `, ${selectedOrder.shippingAddress.state}` : ''} — {selectedOrder.shippingAddress.pincode}</p>
                {selectedOrder.shippingAddress.phone && <p className="text-gray-400 text-xs mt-0.5">{selectedOrder.shippingAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">
                  {selectedOrder.totalAmount >= 500 ? 'FREE' : '₹50'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{selectedOrder.totalAmount >= 500 ? selectedOrder.totalAmount : selectedOrder.totalAmount + 50}</span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="px-5 py-4">
              {!showCancelConfirm ? (
                <button onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-2 text-red-500 border border-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                  <FontAwesomeIcon icon={faXmark} />
                  Cancel Order
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-red-700 text-sm mb-1">Cancel this order?</p>
                  <p className="text-xs text-red-500 mb-3">This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={handleCancel} disabled={cancelLoading}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                      {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </button>
                    <button onClick={() => setShowCancelConfirm(false)}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                      Keep Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Orders List
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
      <div className="space-y-3">
        {orders.map((order) => {
          const s = statusConfig[order.status] || statusConfig.Processing;
          const firstItem = order.items?.[0];
          return (
            <div key={order._id} onClick={() => setSelectedOrder(order)}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-sm hover:border-green-200 transition cursor-pointer flex items-center gap-4">
              <img src={firstItem?.product?.image} alt={firstItem?.product?.name}
                className="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {firstItem?.product?.name}
                  {order.items.length > 1 && (
                    <span className="text-gray-400 font-normal"> +{order.items.length - 1} more</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Order #{order._id.slice(-8).toUpperCase()} · {fmt(order.createdAt)}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">₹{order.totalAmount}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                  {s.label}
                </span>
                <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}