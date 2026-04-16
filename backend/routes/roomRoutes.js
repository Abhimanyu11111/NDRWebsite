// File: routes/roomRoutes.js
import express from 'express';
import {
  getAllRooms,
  getRoomById,
  getRoomsByType,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomAvailability
} from '../controllers/roomController.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/by-type', getRoomsByType);
router.get('/availability', getRoomAvailability);
router.get('/:id', getRoomById);

// Admin routes
router.post('/', verifyAdmin, createRoom);
router.put('/:id', verifyAdmin, updateRoom);
router.delete('/:id', verifyAdmin, deleteRoom);

export default router;