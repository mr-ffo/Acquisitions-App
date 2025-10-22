// src/utils/cookies.js

export const cookies = {
    // Default cookie options
    getOptions: () => ({
        httpOnly: true, // Prevent JS access (protects against XSS)
        secure: process.env.NODE_ENV === "production", // Only https in production
        sameSite: "strict", // Prevent CSRF
        maxAge: 60 * 60 * 1000 // 1 hour
    }),

    // Set cookie
    set: (res, name, value, options = {}) => {
        res.cookie(name, value, { ...cookies.getOptions(), ...options });
    },

    // Get cookie
    get: (req, name) => {
        return req.cookies?.[name] || null;
    },

    // Clear cookie
    clear: (res, name, options = {}) => {
        res.clearCookie(name, { ...cookies.getOptions(), ...options });
    }
};
