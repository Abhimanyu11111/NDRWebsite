import express from "express";
import { initiatePayment, handleCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/callback", handleCallback);

export default router;
