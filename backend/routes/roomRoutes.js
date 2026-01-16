import express from "express";
import { getRooms } from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getRooms);

export default router;
