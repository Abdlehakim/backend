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
const express_1 = require("express");
const Client_1 = __importDefault(require("@/models/Client"));
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, phone, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Username, email, and password are required.' });
            return; // or just "return" here
        }
        // Check if the user already exists
        const existingUser = yield Client_1.default.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: 'Email is already in use.' });
            return;
        }
        // Create new user
        const newUser = new Client_1.default({ username, phone, email, password });
        yield newUser.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    }
    catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
