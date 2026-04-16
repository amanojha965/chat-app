import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 min
    max: 100, // max 100 requests per IP
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth routes (login/signup)
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10, // sirf 10 attempts
    message: {
        success: false,
        message: "Too many login attempts, try again after 15 minutes",
    },
});