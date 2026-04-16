import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/user.schemas.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/multer.middleware.js";

import cloudinary from "../lib/cloudinary.js";
const router = express.Router();

router.post("/signup", authLimiter, validate(registerSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);

router.get("/check", protectRoute, checkAuth);

router.get("/test-cloudinary", async (req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.json(result);
    } catch (error) {
        console.log("Cloudinary test error:", error);
        res.status(500).json({
            message: error.message,
            error,
        });
    }
});

export default router;
