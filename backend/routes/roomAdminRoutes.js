import express from "express";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import {
  getRoomsAdmin,
  createRoom,
  deleteRoom
} from "../controllers/roomAdminController.js";

const router = express.Router();

const createRoomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "room-create",
  includeEmail: false,
  message: "Too many room creation requests. Please try again after 15 minutes.",
});

router.get("/all", verifyAdmin, getRoomsAdmin);
router.post("/create", verifyAdmin, createRoomLimiter, createRoom);
router.delete("/:id", verifyAdmin, deleteRoom);

export default router;
