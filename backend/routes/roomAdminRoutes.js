import express from "express";
import { verifyAdmin } from "../middleware/adminAuth.js";
import {
  getRoomsAdmin,
  createRoom,
  deleteRoom
} from "../controllers/roomAdminController.js";

const router = express.Router();

router.get("/all", verifyAdmin, getRoomsAdmin);
router.post("/create", verifyAdmin, createRoom);
router.delete("/:id", verifyAdmin, deleteRoom);

export default router;
