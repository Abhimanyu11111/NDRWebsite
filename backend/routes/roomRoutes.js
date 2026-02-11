import express from "express";
import authMiddleware from "../middleware/auth.js";
import roomController from "../controllers/roomController.js";

const router = express.Router();

// Public
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

// Protected
router.post("/", authMiddleware, roomController.createRoom);
router.put("/:id", authMiddleware, roomController.updateRoom);
router.delete("/:id", authMiddleware, roomController.deleteRoom);

export default router;
