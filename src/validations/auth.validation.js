// src/validations/auth.validation.js
import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(3).max(255),
    email: z.string().email().max(255).toLowerCase().trim(),
    password: z.string().min(6).max(255),
    role: z.enum(["user", "admin"]).optional().default("user"),
});

export const signinSchema = z.object({
    email: z.string().email().max(255).toLowerCase().trim(),
    password: z.string().min(6).max(255),
});
