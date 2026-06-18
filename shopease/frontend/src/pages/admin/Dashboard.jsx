import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faShoppingBag,
  faDollarSign,
  faUsers,
  faPlus,
  faList,
  faChartBar,
  faCog,
  faRightFromBracket,
  faBell,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api.js";
import AddProduct from "./AddProduct.jsx";
import ManageProducts from "./ManageProducts.jsx";
import ManageOrders from "./ManageOrders.jsx";
import ManageUsers from "./ManageUsers.jsx";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: faChartBar, section: null },
  {
    key: "add-product",
    label: "Add Product",
    icon: faPlus,
    section: "PRODUCTS",
  },
  {
    key: "manage-products",
    label: "Manage Products",
    icon: faBoxOpen,
    section: "PRODUCTS",
  },
  { key: "orders", label: "Orders", icon: faShoppingBag, section: "ORDERS" },
  { key: "users", label: "Users", icon: faUsers, section: "OTHERS" },
  { key: "settings", label: "Settings", icon: faCog, section: "OTHERS" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        API.get("/products"),
        API.get("/orders/all"),
      ]);
      const orders = ordersRes.data;
      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      setStats({
        products: productsRes.data.length,
        orders: orders.length,
        revenue,
        users: 0,
      });
      setRecentOrders(orders.slice(0, 5));
      // Top products by frequency in orders
      const productCount = {};
      orders.forEach((o) =>
        o.items?.forEach((item) => {
          const id = item.product?._id;
          if (id) productCount[id] = (productCount[id] || 0) + item.quantity;
        }),
      );
      const sorted = productsRes.data
        .map((p) => ({ ...p, sold: productCount[p._id] || 0 }))
        .filter((p) => p.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4);
      setTopProducts(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (status) => {
    if (status === "Delivered") return "bg-green-100 text-green-600";
    if (status === "Processing") return "bg-yellow-100 text-yellow-600";
   if (status === 'Packed') return 'bg-blue-100 text-blue-600';
    if (status === "Shipped") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  const sections = [...new Set(menuItems.map((i) => i.section))];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-56 bg-gray-900 flex flex-col lg:flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-xl font-bold">
            <span className="text-white">Shop</span>
            <span className="text-green-400">Ease</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        {/* Admin info */}
        <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-x-auto lg:overflow-y-auto py-3">
          {sections.map((section) => (
            <div key={section} className="mb-2">
              {section && (
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest px-5 py-2">
                  {section}
                </p>
              )}
              {menuItems
                .filter((i) => i.section === section)
                .map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                      active === item.key
                        ? "bg-green-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-400 hover:text-red-400 transition"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 justify-between sm:items-center flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {active === "dashboard"
                ? "Dashboard"
                : active === "add-product"
                  ? "Add Product"
                  : active === "manage-products"
                    ? "Manage Products"
                    : active === "orders"
                      ? "Orders"
                      : active === "users"
                        ? "Users"
                        : "Settings"}
            </h1>
            {active === "dashboard" && (
              <p className="text-sm text-gray-400">
                Welcome back, {user?.name}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative text-gray-500 hover:text-green-600">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
              <FontAwesomeIcon icon={faCalendar} />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Dashboard */}
          {active === "dashboard" && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Total Products",
                    value: stats.products,
                    icon: faBoxOpen,
                    bg: "bg-green-50",
                    color: "text-green-600",
                    trend: "↑ 12% this month",
                  },
                  {
                    label: "Total Orders",
                    value: stats.orders,
                    icon: faShoppingBag,
                    bg: "bg-blue-50",
                    color: "text-blue-600",
                    trend: "↑ 18% this month",
                  },
                  {
                    label: "Total Revenue",
                    value: `$${stats.revenue.toLocaleString()}`,
                    icon: faDollarSign,
                    bg: "bg-yellow-50",
                    color: "text-yellow-600",
                    trend: "↑ 20% this month",
                  },
                  {
                    label: "Total Users",
                    value: stats.users,
                    icon: faUsers,
                    bg: "bg-purple-50",
                    color: "text-purple-600",
                    trend: "↑ 15% this month",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {stat.trend}
                        </p>
                      </div>
                      <div className={`${stat.bg} p-3 rounded-xl`}>
                        <FontAwesomeIcon
                          icon={stat.icon}
                          className={`${stat.color} text-lg`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 overflow-x-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button
                      onClick={() => setActive("orders")}
                      className="text-green-600 text-xs hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No orders yet
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-xs border-b border-gray-100">
                          <th className="text-left pb-3">Order ID</th>
                          <th className="text-left pb-3">Customer</th>
                          <th className="text-left pb-3">Date</th>
                          <th className="text-left pb-3">Amount</th>
                          <th className="text-left pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-b border-gray-50"
                          >
                            <td className="py-3 font-medium text-gray-700">
                              #{order._id.slice(-4).toUpperCase()}
                            </td>
                            <td className="py-3 text-gray-600">
                              {order.user?.name || "User"}
                            </td>
                            <td className="py-3 text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-medium text-gray-800">
                              ${order.totalAmount}
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Top Selling */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Top Selling</h3>
                    <button
                      onClick={() => setActive("manage-products")}
                      className="text-green-600 text-xs hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {topProducts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No products yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.map((p) => (
                        <div key={p._id} className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p.subCategory}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {p.sold}
                            </p>
                            <p className="text-xs text-gray-400">Sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    label: "Add Product",
                    desc: "Add a new product",
                    icon: faPlus,
                    key: "add-product",
                    bg: "bg-green-50",
                    color: "text-green-600",
                  },
                  {
                    label: "Manage Products",
                    desc: "View and manage products",
                    icon: faBoxOpen,
                    key: "manage-products",
                    bg: "bg-blue-50",
                    color: "text-blue-600",
                  },
                  {
                    label: "View Orders",
                    desc: "View all customer orders",
                    icon: faShoppingBag,
                    key: "orders",
                    bg: "bg-yellow-50",
                    color: "text-yellow-600",
                  },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(action.key)}
                    className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition text-left"
                  >
                    <div className={`${action.bg} p-3 rounded-xl`}>
                      <FontAwesomeIcon
                        icon={action.icon}
                        className={`${action.color} text-lg`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === "add-product" && (
            <AddProduct
              onSuccess={() => {
                fetchStats();
                setActive("manage-products");
              }}
            />
          )}
          {active === "manage-products" && <ManageProducts />}
          {active === "orders" && <ManageOrders />}
          {active === "users" && <ManageUsers />}
          {active === "settings" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Settings</h3>
              <p className="text-sm text-gray-400">Settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
