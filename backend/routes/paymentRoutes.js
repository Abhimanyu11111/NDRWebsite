import express from "express";
import { initiatePayment, paymentResponse } from "../controllers/paymentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/initiate", auth, initiatePayment);
router.post("/response", paymentResponse);

export default router;