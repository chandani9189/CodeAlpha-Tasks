import { useState, useEffect } from 'react';
import API from '../../services/api.js';

const statusColor = (status) => {
  if (status === 'Delivered') return 'bg-green-100 text-green-600';
  if (status === 'Processing') return 'bg-yellow-100 text-yellow-600';
  if (status === 'Packed') return 'bg-blue-100 text-blue-600';
  if (status === 'Shipped') return 'bg-purple-100 text-purple-600';
  if (status === 'Cancelled') return 'bg-red-100 text-red-600';
  return 'bg-gray-100 text-gray-600';
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/all');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/status/${id}`, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4">All Orders ({orders.length})</h3>
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">No orders yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-100">
              <th className="text-left pb-3">Order ID</th>
              <th className="text-left pb-3">Customer</th>
              <th className="text-left pb-3">Date</th>
              <th className="text-left pb-3">Amount</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-700">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td className="py-3 text-gray-600">{order.user?.name || 'User'}</td>
                <td className="py-3 text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3 font-semibold text-gray-900">₹{order.totalAmount}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3">
                  <select value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500">
                    <option>Processing</option>
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}