import Joi from "joi";

export const registerSchema = Joi.object({
    email: Joi.string().email().min(5).max(50).required(),

    fullName: Joi.string().min(3).max(30).required(),

    password: Joi.string()
        .min(6)
        .max(20)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character",
        }),

    profilePic: Joi.string().uri().max(500).optional().allow(""),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().min(5).max(50).required(),

    password: Joi.string().min(6).max(20).required(),
});