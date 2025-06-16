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
// src/routes/contactus.ts
const express_1 = require("express");
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendconctusts_1 = require("@/lib/sendconctusts");
const router = (0, express_1.Router)();
// POST /api/NavMenu/contactus/PostForm
router.post("/PostForm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, message } = req.body;
        // Validate the required fields
        if (!name || !email || !message) {
            res.status(400).json({ error: "Name, email, and message are required" });
            return;
        }
        // Create the transporter
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Email to website contact
        const mailOptions1 = {
            from: process.env.EMAIL_FROM,
            to: process.env.Email_Contact,
            subject: `${name} contacted you`,
            html: (0, sendconctusts_1.contactFormTemplate)(name, email, message),
        };
        // Confirmation email to sender
        const mailOptions2 = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Contact request successfully received",
            html: "Hello, thank you for reaching out. We will get back to you soon.",
        };
        // Send both emails in parallel
        yield Promise.all([
            transporter.sendMail(mailOptions1),
            transporter.sendMail(mailOptions2),
        ]);
        res.status(200).json({ message: "Email sent successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error posting contact" });
    }
}));
exports.default = router;
