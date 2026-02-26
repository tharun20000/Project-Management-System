import express from "express";
import { createChat, userChats, findChat, getProjectChat } from "../controllers/chat.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createChat);
router.get("/:userId", verifyToken, userChats);
router.get("/find/:firstId/:secondId", verifyToken, findChat);
router.get("/project/:projectId", verifyToken, getProjectChat);

export default router;
