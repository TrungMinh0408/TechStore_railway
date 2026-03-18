import express from "express";
import { getAll } from "../../controllers/admin/inventoriesController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
const router = express.Router();
router.use(authMiddleware, isAdminMiddleware);
router.get("/", getAll);

export default router;