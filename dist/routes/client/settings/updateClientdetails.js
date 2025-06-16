"use strict";
/// updateClientdetails
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Client_1 = __importDefault(require("@/models/Client"));
const authenticateToken_1 = require("@/middleware/authenticateToken");
const router = (0, express_1.Router)();
/**
 * PUT /api/auth/update
 * Update the authenticated user's profile.
 */
router.put('/update', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { username, email, phone } = req.body;
        // Validate required fields
        if (!username || !email) {
            res.status(400).json({ error: "Username and email are required." });
            return;
        }
        // Update the user's data in the database
        const updatedUser = yield Client_1.default.findByIdAndUpdate(userId, { username, email, phone }, { new: true, runValidators: true } // Return the updated document and run schema validations
        ).select('-password'); // Exclude the password field
        if (!updatedUser) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        res.json(updatedUser);
    }
    catch (err) {
        console.error("Error updating profile:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Internal server error." });
        }
    }
}));
exports.default = router;
