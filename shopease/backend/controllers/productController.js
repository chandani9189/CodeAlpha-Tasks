import Product from '../models/Product.js';
import { uploadToImageKit } from '../config/imagekit.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add product with multiple images
export const addProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'Please upload at least one image!' });

    const { name, price, originalPrice, category,
            subCategory, sizes, colors, description, stock } = req.body;

    // Upload all images to ImageKit
    const imageUrls = await Promise.all(
      req.files.map((file) => uploadToImageKit(file.buffer, file.originalname))
    );

    const discount = originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const product = await Product.create({
      name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discount,
      category,
      subCategory,
      sizes: sizes.split(','),
      colors: colors.split(','),
      image: imageUrls[0],      // First image = main image
      images: imageUrls,        // All images
      description,
      stock: Number(stock) || 10,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product with multiple images
export const updateProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, category,
            subCategory, sizes, colors, description, stock } = req.body;

    let imageFields = {};
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map((file) => uploadToImageKit(file.buffer, file.originalname))
      );
      imageFields = {
        image: imageUrls[0],
        images: imageUrls,
      };
    }

    const discount = originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount,
        category,
        subCategory,
        sizes: sizes.split(','),
        colors: colors.split(','),
        description,
        stock: Number(stock),
        ...imageFields,
      },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};