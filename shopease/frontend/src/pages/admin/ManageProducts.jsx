import { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faXmark, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

const subCategoriesByCategory = {
  Men: ['Topwear', 'Bottomwear', 'Footwear'],
  Women: ['Topwear', 'Bottomwear', 'Footwear', 'Accessories'],
};

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with product data
  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      subCategory: product.subCategory,
      sizes: product.sizes || [],
      colors: product.colors?.join(', ') || '',
      description: product.description || '',
      stock: product.stock || 10,
    });
    setEditPreview(product.image);
    setEditImage(null);
    setEditError('');
  };

  const closeEdit = () => {
    setEditProduct(null);
    setEditForm({});
    setEditImage(null);
    setEditPreview(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const toggleEditSize = (size) => {
    setEditForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('price', editForm.price);
      formData.append('originalPrice', editForm.originalPrice);
      formData.append('category', editForm.category);
      formData.append('subCategory', editForm.subCategory);
      formData.append('sizes', editForm.sizes.join(','));
      formData.append('colors', editForm.colors);
      formData.append('description', editForm.description);
      formData.append('stock', editForm.stock);
      if (editImage) formData.append('image', editImage);

      const { data } = await API.put(`/products/${editProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update product in list
      setProducts((prev) => prev.map((p) => p._id === data._id ? data : p));
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4">Manage Products ({products.length})</h3>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">No products added yet</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-100">
              <th className="text-left pb-3">Product</th>
              <th className="text-left pb-3">Category</th>
              <th className="text-left pb-3">Price</th>
              <th className="text-left pb-3">Stock</th>
              <th className="text-left pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.subCategory}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-gray-600">{p.category}</td>
                <td className="py-3">
                  <p className="font-semibold text-gray-900">₹{p.price}</p>
                  {p.discount > 0 && (
                    <p className="text-xs text-green-600">{p.discount}% off</p>
                  )}
                </td>
                <td className="py-3 text-gray-600">{p.stock}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    {/* Edit button */}
                    <button onClick={() => openEdit(p)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="Edit product">
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    {/* Delete button */}
                    <button onClick={() => setDeleteId(p._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete product">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* ── DELETE CONFIRM DIALOG ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-4">
              <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            </div>
            <h3 className="text-center font-bold text-gray-900 text-lg">Delete Product?</h3>
            <p className="text-center text-sm text-gray-500 mt-2">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Edit Product</h3>
              <button onClick={closeEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              {editError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{editError}</div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name</label>
                    <input name="name" value={editForm.name} onChange={handleEditChange} required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>

                  {/* Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹)</label>
                      <input name="price" value={editForm.price} onChange={handleEditChange} type="number" required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Original Price (₹)</label>
                      <input name="originalPrice" value={editForm.originalPrice} onChange={handleEditChange} type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                      <select name="category" value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value, subCategory: subCategoriesByCategory[e.target.value][0] })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                        <option>Men</option>
                        <option>Women</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Sub Category</label>
                      <select name="subCategory" value={editForm.subCategory} onChange={handleEditChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500">
                        {subCategoriesByCategory[editForm.category]?.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sizes</label>
                    <div className="flex gap-2 flex-wrap">
                      {allSizes.map((size) => (
                        <button type="button" key={size} onClick={() => toggleEditSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                            editForm.sizes?.includes(size)
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 text-gray-600 hover:border-green-500'
                          }`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Colors (comma separated)</label>
                    <input name="colors" value={editForm.colors} onChange={handleEditChange}
                      placeholder="Red, Blue, Green"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                    <input name="stock" value={editForm.stock} onChange={handleEditChange} type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                    <textarea name="description" value={editForm.description} onChange={handleEditChange}
                      rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
                  </div>
                </div>

                {/* Right — image */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Product Image</label>
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition h-56">
                    {editPreview ? (
                      <img src={editPreview} alt="preview"
                        className="h-full w-full object-contain rounded-lg" />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Click to change image</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleEditImage} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Leave empty to keep current image</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={closeEdit}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
