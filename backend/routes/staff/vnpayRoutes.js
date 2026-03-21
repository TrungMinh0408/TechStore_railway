import express from "express";
import { createPayment, vnpayIPN } from "../../controllers/staff/vnpayController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createPayment);
router.get("/ipn", vnpayIPN);


export default router;