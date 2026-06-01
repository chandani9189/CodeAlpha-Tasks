import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/slices/cartSlice.js';

const subCategories = ['Topwear', 'Bottomwear', 'Footwear', 'Accessories'];

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹3000', min: 2000, max: 3000 },
  { label: 'Above ₹3000', min: 3000, max: 99999 },
];

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
const getSizes = (sub) => {
  if (sub === 'Footwear') return footwearSizes;
  if (sub === 'Accessories') return [];
  return clothingSizes;
};
const colors = ['#000000', '#FFFFFF', '#D4A96A', '#F48FB1', '#D32F2F', '#2E7D32', '#1A237E', '#9C27B0'];

export default function Women() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCat, setActiveSubCat] = useState(null);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [viewAllSub, setViewAllSub] = useState(null);

const dispatch = useDispatch();
const { user } = useSelector((state) => state.auth);

useEffect(() => {
  fetchProducts();
  if (user) dispatch(fetchCart()); 
}, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products?category=Women');
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubCatClick = (sub) => {
    setActiveSubCat(sub);
    setViewAllSub(sub);
    const el = document.getElementById(sub);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const applyFilters = (list) => {
    let filtered = [...list];
    if (selectedPrices.length > 0) {
      filtered = filtered.filter((p) =>
        selectedPrices.some((label) => {
          const range = priceRanges.find((r) => r.label === label);
          return p.price >= range.min && p.price <= range.max;
        })
      );
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    }
    return filtered;
  };

  const getGrouped = () => {
    const base = activeSubCat ? products.filter((p) => p.subCategory === activeSubCat) : products;
    const filtered = applyFilters(base);
    if (viewAllSub) {
      return { [viewAllSub]: filtered.filter((p) => p.subCategory === viewAllSub) };
    }
    return subCategories.reduce((acc, sub) => {
      const items = filtered.filter((p) => p.subCategory === sub);
      if (items.length > 0) acc[sub] = items;
      return acc;
    }, {});
  };

  const grouped = getGrouped();

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Women</h1>
        <p className="text-sm text-gray-400 mt-1">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <span className="mx-2">›</span>
          {viewAllSub ? (
            <>
              <button onClick={() => { setViewAllSub(null); setActiveSubCat(null); }} className="hover:text-green-600">Women</button>
              <span className="mx-2">›</span>
              <span>{viewAllSub}</span>
            </>
          ) : <span>Women</span>}
        </p>
      </div>

      <div className="flex px-8 pb-10 gap-6 mt-4">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => { setActiveSubCat(null); setViewAllSub(null); }}
                  className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition ${
                    activeSubCat === null ? 'text-green-600 bg-green-50 font-semibold' : 'text-gray-600 hover:text-green-600'
                  }`}
                >All</button>
              </li>
              {subCategories.map((sub) => (
                <li key={sub}>
                  <button
                    onClick={() => handleSubCatClick(sub)}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition ${
                      activeSubCat === sub ? 'text-green-600 bg-green-50 font-semibold' : 'text-gray-600 hover:text-green-600'
                    }`}
                  >{sub}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>

            {/* Price */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Price</p>
              {priceRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2 text-sm text-gray-600 mb-1.5 cursor-pointer">
                  <input type="checkbox" checked={selectedPrices.includes(range.label)}
                    onChange={() => setSelectedPrices((prev) =>
                      prev.includes(range.label) ? prev.filter((i) => i !== range.label) : [...prev, range.label]
                    )}
                    className="accent-green-600" />
                  {range.label}
                </label>
              ))}
            </div>

            {/* Size */}
            {getSizes(activeSubCat).length > 0 && (
  <div className="mb-4">
    <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
    {getSizes(activeSubCat).map((size) => (
      <label key={size} className="flex items-center gap-2 text-sm text-gray-600 mb-1.5 cursor-pointer">
        <input type="checkbox" checked={selectedSizes.includes(size)}
          onChange={() => setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((i) => i !== size) : [...prev, size]
          )}
          className="accent-green-600" />
        {size}
      </label>
    ))}
  </div>
)}

            {/* Color */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color}
                    onClick={() => setSelectedColors((prev) =>
                      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                    )}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      selectedColors.includes(color) ? 'border-green-600 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {(selectedPrices.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0) && (
              <button
                onClick={() => { setSelectedPrices([]); setSelectedSizes([]); setSelectedColors([]); }}
                className="text-xs text-red-500 hover:underline mt-1"
              >Clear all filters</button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try changing your filters</p>
            </div>
          ) : (
            Object.entries(grouped).map(([sub, items]) => (
              <div key={sub} id={sub} className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">{sub}</h2>
                  {!viewAllSub && items.length >= 5 && (
                    <button
                      onClick={() => { setViewAllSub(sub); setActiveSubCat(sub); }}
                      className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      View All <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </button>
                  )}
                  {viewAllSub && (
                    <button
                      onClick={() => { setViewAllSub(null); setActiveSubCat(null); }}
                      className="text-green-600 text-sm font-medium hover:underline"
                    >← Back</button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {(viewAllSub ? items : items.slice(0, 4)).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}