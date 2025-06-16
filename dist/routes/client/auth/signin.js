"use strict";
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
// routes/signin.ts
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const Client_1 = __importDefault(require("@/models/Client"));
const router = (0, express_1.Router)();
// ① Assert and type the secret exactly once
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
// Helper to generate JWT
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, // now a guaranteed string
    { expiresIn: '1h' });
}
// Email/Password Sign-in
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = yield Client_1.default.findOne({ email: normalizedEmail });
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user);
        res.cookie('token_FrontEnd', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });
        res.json({
            user: { id: user._id.toString(), email: user.email },
        });
    }
    catch (error) {
        console.error('Sign-in Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Google Sign-In
router.post('/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ message: 'idToken is required' });
            return;
        }
        const ticket = yield googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(401).json({ message: 'Google authentication failed' });
            return;
        }
        const email = payload.email.toLowerCase().trim();
        const newName = payload.name || payload.given_name || '';
        const newPhone = payload.phone || '';
        let user = yield Client_1.default.findOne({ email });
        if (user) {
            let updated = false;
            if (newName && user.username !== newName) {
                user.username = newName;
                updated = true;
            }
            if (newPhone && user.phone !== newPhone) {
                user.phone = newPhone;
                updated = true;
            }
            if (updated)
                yield user.save();
        }
        else {
            user = yield Client_1.default.create({
                email,
                username: newName,
                phone: newPhone,
                isGoogleAccount: true,
            });
        }
        const token = generateToken(user);
        res.cookie('token_FrontEnd', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });
        res.json({ user: { id: user._id.toString(), email: user.email } });
    }
    catch (error) {
        console.error('Google Signin Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
