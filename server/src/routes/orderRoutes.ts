import { Router } from "express";
import {
  checkout,
  myOrders,
  getMyOrder,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.post("/checkout", checkout);
router.get("/mine", myOrders);
router.get("/mine/:id", getMyOrder);

// Admin
router.get("/", requireAdmin, listAllOrders);
router.put("/:id/status", requireAdmin, updateOrderStatus);

export default router;
