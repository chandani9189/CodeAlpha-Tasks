import Wishlist from '../models/Wishlist.js';

// ── Wishlist dekho ────────────────────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items');
    res.json(wishlist || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Product add karo ──────────────────────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [productId] });
    } else {
      if (!wishlist.items.map(i => i.toString()).includes(productId)) {
        wishlist.items.push(productId);
        await wishlist.save();
      }
    }

    // ✅ Populate karke return karo — frontend ko full product data milega
    await wishlist.populate('items');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Product remove karo ───────────────────────────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.json({ items: [] });

    wishlist.items = wishlist.items.filter(
      (i) => i.toString() !== req.params.productId
    );
    await wishlist.save();

    // ✅ Populate karke return karo — frontend ko sahi count milega
    await wishlist.populate('items');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};