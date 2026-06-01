import Cart from '../models/Cart.js';

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add item
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, size, color }],
      });
    } else {
      const exists = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size
      );
      if (exists) {
        exists.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, size, color });
      }
      await cart.save();
    }

    // Populate before returning
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    cart.items = cart.items.filter(
      (i) => i._id.toString() !== req.params.itemId
    );
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update quantity
export const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart.items.find(
      (i) => i._id.toString() === req.params.itemId
    );
    if (item) item.quantity = quantity;
    await cart.save();
    // Populate before returning — this was missing!
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};