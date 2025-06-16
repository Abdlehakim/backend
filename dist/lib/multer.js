"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryUpload = void 0;
// lib/multer.ts  – single instance for all image routes
const multer_1 = __importDefault(require("multer"));
exports.memoryUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
