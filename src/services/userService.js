// src/services/userService.js
import {
    createUser,
    getUserById,
    getAllUsers,
    getUserByEmail,
    updateUser,
    deleteUser,
} from "#models/userModel.js";

import logger from "#config/logger.js";
import bcrypt from "bcrypt";

// 🔐 Password Hasher
export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error(`Password hashing failed: ${error.message}`);
        throw new Error("Could not hash password");
    }
};

// 👤 Register User Service
export const registerUser = async (userData) => {
    try {
        const { userId, name, email, password, role = "user" } = userData;

        // ✅ Validation
        if (!userId || !name || !email || !password) {
            logger.warn("Missing required user registration fields");
            throw new Error("All fields (userId, name, email, password) are required");
        }

        // ✅ Prevent duplicate email
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            logger.warn(`User with email ${email} already exists`);
            throw new Error("User with this email already exists");
        }

        // ✅ Hash password
        const hashedPassword = await hashPassword(password);

        // ✅ User object
        const newUser = {
            userId,
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // ✅ Save user
        const savedUser = await createUser(newUser);

        logger.info(`User created successfully: ${email}`);
        return savedUser;

    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        throw error;
    }
};

// 🔍 Find a user by ID
export const findUserById = async (userId) => {
    try {
        const user = await getUserById(userId);
        if (!user) throw new Error("User not found");
        return user;
    } catch (error) {
        logger.error(`Error finding user by ID: ${error.message}`);
        throw error;
    }
};

// 👥 Find all users
export const findAllUsers = async () => {
    try {
        return await getAllUsers();
    } catch (error) {
        logger.error(`Error retrieving all users: ${error.message}`);
        throw new Error("Error fetching users");
    }
};

// ✏️ Update user info
export const modifyUser = async (userId, updates) => {
    try {
        updates.updatedAt = new Date().toISOString();
        return await updateUser(userId, updates);
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        throw new Error("Error updating user");
    }
};

// 🗑️ Delete user
export const removeUser = async (userId) => {
    try {
        return await deleteUser(userId);
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        throw new Error("Error deleting user");
    }
};

// 🔐 Password Verification
export const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        logger.error(`Password verification failed: ${error.message}`);
        throw new Error("Could not verify password");
    }
};

// 🔓 Sign In User Service
export const signinUser = async (email, password) => {
    try {
        // ✅ Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            logger.warn(`Sign-in attempt with non-existent email: ${email}`);
            throw new Error("Invalid email or password");
        }

        // ✅ Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            logger.warn(`Invalid password attempt for email: ${email}`);
            throw new Error("Invalid email or password");
        }

        logger.info(`User signed in successfully: ${email}`);
        
        // ✅ Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;

    } catch (error) {
        logger.error(`Error signing in user: ${error.message}`);
        throw error;
    }
};

// 🔓 Sign Out User Service
export const signoutUser = async (userId) => {
    try {
        logger.info(`User signed out successfully: ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Error signing out user: ${error.message}`);
        throw error;
    }
};
