import Order from '../models/Order.js';
import Cart  from '../models/Cart.js';

// ── Place Order ───────────────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', upiId, cardLast4 } = req.body;

    // Validate address fields
    const { fullName, phone, street, city, pincode } = shippingAddress || {};
    if (!fullName || !phone || !street || !city || !pincode) {
      return res.status(400).json({ error: 'Incomplete shipping address' });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Build order items & total
    const items = cart.items.map((i) => ({
      product:  i.product._id,
      quantity: i.quantity,
      size:     i.size  || null,
      color:    i.color || null,
      price:    i.product.price,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping    = totalAmount >= 500 ? 0 : 50;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount: totalAmount + shipping,
      shippingAddress,
      paymentMethod,
      ...(paymentMethod === 'upi'  && { upiId }),
      ...(paymentMethod === 'card' && { cardLast4 }),
    });

    // Clear cart after order placed
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get My Orders ─────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get All Orders (Admin) ────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Update Order Status (Admin) ───────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'Cancelled' && { cancelledAt: new Date() }),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Cancel Order (User) ───────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Sirf apna order cancel kar sake
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // Sirf Processing stage pe cancel ho sakta hai
    if (order.status !== 'Processing') {
      return res.status(400).json({
        error: `Order cannot be cancelled — it is already "${order.status}"`,
      });
    }

    order.status      = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};