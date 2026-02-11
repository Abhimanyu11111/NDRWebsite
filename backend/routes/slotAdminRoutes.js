import express from "express";
import { verifyAdmin } from "../middleware/adminAuth.js";
import {
  getSlotsByRoom,
  createSlot,
  deleteSlot,
  updateSlotStatus
} from "../controllers/slotAdminController.js";

const router = express.Router();

router.get("/:roomId", verifyAdmin, getSlotsByRoom);
router.post("/create", verifyAdmin, createSlot);
router.put("/:slotId", verifyAdmin, updateSlotStatus);
router.delete("/:slotId", verifyAdmin, deleteSlot);

export default router;
