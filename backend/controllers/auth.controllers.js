import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookies.js";

import { sendVerificationEmail, sendWelcomeEmail, sendOTPEmail, sendResetEmail, sendResetSuccessEmail, sendDeleteEmail } from '../nodemailer/sendEmail.js';

// Signup Api

export const signup = async (req, res) => {
    const { name, email, password, accountType } = req.body;

    try {
        if (!email || !password || !name || !accountType) {
            throw new Error("All fields are required!");
        }

        // Check if the user already exists
        const userAlreadyExist = await User.findOne({ email });

        if (userAlreadyExist) {
            return res.status(409).json({ success: false, message: "User already exists!" });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user without verification fields
        const user = new User({
            email,
            password: hashPassword,
            name,
            accountType,
            isVerified: true, // Mark as verified by default
        });

        // Save the user to db
        await user.save();

        // Generate token and set cookie
        generateTokenAndSetCookie(res, user._id);

        // Respond with success
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            user: {
                ...user._doc,
                password: undefined, 
            },
        });
        console.log("User registered without email verification!");
    } catch (error) {
        console.log("Error in registering user:", error);
        res.status(400).json({ success: false, message: "Error in creating user!" });
    }
};
//signup route revision

//verifying email through verification code 
export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        // Find the user with the provided verification code and check if the code is still valid
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }, // Ensure the token is not expired
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Verification code is invalid or expired!",
            });
        }

        // Update user properties to mark them as verified
        user.isVerified = true;
        user.verificationToken = undefined; // Remove verification token
        user.verificationTokenExpiresAt = undefined; // Remove token expiration date
        await user.save();

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            user: {
                ...user._doc,
                password: undefined, // Exclude sensitive data
            },
        });

        console.log("Email verified successfully!");
        await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
        console.error("Error in email verification:", error);
        res.status(500).json({
            success: false,
            message: "Error in verifying the user!",
            error: error.message,
        });
    }
};

// singin
export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credientials!" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credientials!" })

        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "successfully signed in!",
            user: {
                ...user._doc,
                password: undefined
            }
        })
        console.log("singed in!")
    } catch (error) {
        console.log("error in login!", error)
        res.status(400).json({ success: false, message: "error in singing you inn!" })
    }
}

//logout
export const logout = async (req, res) => {
    try {
        // Clear the cookie named 'token'
        res.clearCookie("token", {
            httpOnly: true,  // Match with the original cookie options
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "strict",  // Prevent cross-site cookie usage
            path: "/", // Ensure it matches the path used when the cookie was set
        });

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

        // Optional server-side logging
        console.log("User logged out successfully");
    } catch (error) {
        // Handle potential errors
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed. Please try again.",
        });
    }
};


//forgotpassword
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email!" });
        }

        // Generate reset token and expiration
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();
        // Send reset email
        const resetLink = `${process.env.CLIENT_URL}reset-password/${resetToken}`;

        await sendResetEmail(user.email, user.name, resetLink);

        return res.status(200).json({
            success: true,
            message: "Password reset link sent successfully! Please check your email.",
        });
        console.log("reset link sent to your email", email)
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: "Error in sending reset link." });
    }
};


//this function resets password and save it to database
export const resetPassword = async (req, res) => {
    const { token } = req.params; // Token passed as part of URL
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear reset fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        // Send success email
        await sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successful!" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "Error resetting password." });
    }
};


export const checkAuth = async (req, res) => {
    try {
        // Fetch user by ID from the request object, excluding password
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        // Respond with user data if found
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying user!",
            error: error.message
        });
    }
};

// Delete user API
export const deleteUser = async (req, res) => {
    const { email } = req.body; // Get email from the request body

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        // Delete the user
        await User.findOneAndDelete({ email });
        console.log("user Deleted")
        // Send an email notification after deletion
        await sendDeleteEmail(user.email);

        // Respond with success
        res.status(200).json({
            success: true,
            message: "User deleted successfully!"
        });

    } catch (error) {
        console.error("Error in deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Error in deleting user!"
        });
    }
};
