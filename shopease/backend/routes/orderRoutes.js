import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder, 
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/all", protect, adminOnly, getAllOrders);
router.put("/status/:id", protect, adminOnly, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder); 

export default router;
