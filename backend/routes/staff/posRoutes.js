import express from "express";
import { getPosProducts } from "../../controllers/staff/posController.js";
import { getAll as getCategories } from "../../controllers/admin/categoriesController.js";
import { searchs } from "../../controllers/staff/searchController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { checkoutPOS, confirmQRPayment, getPaymentStatus} from "../../controllers/staff/checkoutController.js";

const router = express.Router();

router.get("/products", authMiddleware, getPosProducts);

router.get("/categories", authMiddleware, getCategories);

router.get("/search", authMiddleware, searchs);

router.post("/checkout", authMiddleware, checkoutPOS);

router.get("/confirm-qr/:paymentId", confirmQRPayment);
router.get("/payment-status/:paymentId", getPaymentStatus);
export default router;