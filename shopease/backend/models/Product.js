import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  discount: Number,
  category: { type: String, enum: ['Men', 'Women'] },
  subCategory: String,
  sizes: [String],
  colors: [String],
  image: String,          // Main image
  images: [String],       // All images array
  stock: { type: Number, default: 10 },
  description: String,
}, { timestamps: true });

export default mongoose.model('Product', productSchema);