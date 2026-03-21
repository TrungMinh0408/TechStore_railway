import express from "express";
import { createPayment, vnpayIPN } from "../../controllers/staff/vnpayController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

app.use(authMiddleware);
const router = express.Router();
router.post("/create", createPayment);
router.get("/ipn", vnpayIPN);


export default router;