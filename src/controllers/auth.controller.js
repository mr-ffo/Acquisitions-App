// src/controllers/auth.controller.js
import logger from "#config/logger.js";
import { signupSchema, signinSchema } from "#validations/auth.validation.js";
import { formatValidationError } from "#utils/format.js";
import { registerUser, signinUser, signoutUser } from "#services/userService.js";
import { jwtToken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

export const signup = async (req, res, next) => {
    try {
        // ✅ Validate request body
        const validationResult = signupSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: formatValidationError(validationResult.error),
            });
        }

        const { name, email, password, role } = validationResult.data;

        // ✅ Create userId manually (you can replace with UUID later)
        const userId = Date.now().toString();

        // ✅ Create new user
        const user = await registerUser({ userId, name, email, password, role });

        // ✅ Generate JWT token
        const token = jwtToken.sign({
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        // ✅ Set cookie
        cookies.set(res, "token", token);

        logger.info(`✅ User registered successfully: ${email}`);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token, // Optional: you can remove this if using only cookies
        });

    } catch (e) {
        logger.error(`❌ Signup error: ${e.message}`);
        if (e.message === "User with this email already exists") {
            return res.status(409).json({ error: e.message });
        }
        next(e);
    }
};

export const signin = async (req, res, next) => {
    try {
        // ✅ Validate request body
        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: formatValidationError(validationResult.error),
            });
        }

        const { email, password } = validationResult.data;

        // ✅ Authenticate user
        const user = await signinUser(email, password);

        // ✅ Generate JWT token
        const token = jwtToken.sign({
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        // ✅ Set secure cookie
        cookies.set(res, "token", token);

        logger.info(`✅ User signed in successfully: ${email}`);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token, // Optional: remove if using only cookies
        });

    } catch (e) {
        logger.error(`❌ Signin error: ${e.message}`);
        if (e.message === "Invalid email or password") {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        next(e);
    }
};

export const signout = async (req, res, next) => {
    try {
        // ✅ Get user info from token (if available)
        const token = cookies.get(req, "token");
        let userId = null;
        
        if (token) {
            try {
                const decoded = jwtToken.verify(token);
                userId = decoded.id;
            } catch (e) {
                // Token invalid, but still proceed with signout
                logger.warn(`Invalid token during signout: ${e.message}`);
            }
        }

        // ✅ Clear authentication cookie
        cookies.clear(res, "token");

        // ✅ Log signout (optional service call)
        if (userId) {
            await signoutUser(userId);
        }

        logger.info(`✅ User signed out successfully${userId ? `: ${userId}` : ''}`);

        return res.status(200).json({
            message: "Signed out successfully"
        });

    } catch (e) {
        logger.error(`❌ Signout error: ${e.message}`);
        // Still clear the cookie even if there's an error
        cookies.clear(res, "token");
        return res.status(200).json({
            message: "Signed out successfully"
        });
    }
};
