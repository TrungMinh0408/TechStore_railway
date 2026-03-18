import express from "express";
import { createPayment, vnpayIPN } from "../../controllers/staff/vnpayController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/create", authMiddleware, createPayment);
router.get("/ipn", authMiddleware, vnpayIPN);


export default router;