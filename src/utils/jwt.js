import jwt from "jsonwebtoken";
import logger from "#config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

if (!process.env.JWT_SECRET) {
    logger.warn("JWT_SECRET is not set in environment variables. Using fallback secret.");
}

export const jwtToken = {
    // Generate a JWT token
    sign: (payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
        } catch (e) {
            logger.error("Failed to sign JWT", e);
            throw new Error("JWT signing failed");
        }
    },

    // Verify a JWT token
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (e) {
            logger.error("Invalid or expired JWT", e);
            throw new Error("JWT verification failed");
        }
    },
};
