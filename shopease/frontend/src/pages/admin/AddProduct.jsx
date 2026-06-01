import { useState, useRef } from 'react';
import API from '../../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function AddProduct({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', price: '', originalPrice: '', category: 'Men',
    subCategory: 'Topwear', sizes: [], colors: '', description: '', stock: '10',
  });
  const [images, setImages] = useState([]);   // { file, preview }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);              // ref to reset input value

  const subCategories = {
    Men: ['Topwear', 'Bottomwear', 'Footwear'],
    Women: ['Topwear', 'Bottomwear', 'Footwear', 'Accessories'],
  };

 const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
const getSizes = (sub) => {
  if (sub === 'Footwear') return footwearSizes;
  if (sub === 'Accessories') return [];
  return clothingSizes;
};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle multiple image selection
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Remove one image
  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview); // free memory
      updated.splice(index, 1);
      return updated;
    });
    // Reset input ref so same image can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return setError('Please select at least one image!');
    if (getSizes(form.subCategory).length > 0 && form.sizes.length === 0)
  return setError('Please select at least one size!');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();

      // Append all form fields
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, Array.isArray(val) ? val.join(',') : val);
      });

      // Append all images with same key 'images'
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-5">Add New Product</h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Men Casual Shirt"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹)</label>
              <input name="price" value={form.price} onChange={handleChange} required type="number"
                placeholder="999"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Original Price (₹)</label>
              <input name="originalPrice" value={form.originalPrice} onChange={handleChange} type="number"
                placeholder="1499"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select name="category" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: subCategories[e.target.value][0] })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                <option>Men</option>
                <option>Women</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sub Category</label>
              <select name="subCategory" value={form.subCategory} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                {subCategories[form.category].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Sizes */}
          {getSizes(form.subCategory).length > 0 ? (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-2 block">Sizes</label>
    <div className="flex gap-2 flex-wrap">
      {getSizes(form.subCategory).map((size) => (
        <button type="button" key={size} onClick={() => toggleSize(size)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition ${
            form.sizes.includes(size)
              ? 'bg-green-600 text-white border-green-600'
              : 'border-gray-300 text-gray-600 hover:border-green-500'
          }`}>
          {size}
        </button>
      ))}
    </div>
  </div>
) : (
  <p className="text-sm text-gray-400 italic py-1">No size applicable for Accessories</p>
)}

          {/* Colors */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Colors (comma separated)</label>
            <input name="colors" value={form.colors} onChange={handleChange}
              placeholder="Red, Blue, Green"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
            <input name="stock" value={form.stock} onChange={handleChange} type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Product description..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
          </div>
        </div>

        {/* Right — Multiple image upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Product Images <span className="text-gray-400 font-normal">(select multiple)</span>
          </label>

          {/* Upload area */}
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition">
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Multiple allowed</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="hidden"
            />
          </label>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img src={img.preview} alt={`img-${index}`}
                    className="w-full h-24 object-cover" />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  {/* First image badge */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {images.length} image{images.length > 1 ? 's' : ''} selected — First image will be the main image
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="col-span-2">
          <button type="submit" disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50">
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}