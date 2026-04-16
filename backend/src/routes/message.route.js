import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, markMessagesAsSeen } from "../controllers/message.controller.js";
import upload from "../middleware/multer.middleware.js";
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);
router.put("/mark-seen/:id", protectRoute, markMessagesAsSeen);

export default router;
