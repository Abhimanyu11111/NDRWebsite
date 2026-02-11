import express from "express";
import { getDashboardCounts } from "../controllers/adminDashboardController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";


const router = express.Router();

router.get("/counts", verifyAdmin, getDashboardCounts);

export default router;
