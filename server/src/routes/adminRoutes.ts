import { Router } from "express";
import { listUsers, updateUserRole, deleteUser, dashboardOverview } from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/overview", dashboardOverview);
router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
