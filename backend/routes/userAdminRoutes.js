import express from "express";
import {
  getAllUsersAdmin,
  updateUserStatus
} from "../controllers/userAdminController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin – get all users
router.get("/admin/users", verifyAdmin, getAllUsersAdmin);

// Admin – update user status
router.put("/admin/users/:id/status", verifyAdmin, updateUserStatus);

export default router;
