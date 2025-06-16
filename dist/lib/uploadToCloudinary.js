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
exports.uploadToCloudinary = uploadToCloudinary;
// lib/uploadToCloudinary.ts  (from the previous message, unchanged)
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("./cloudinary"));
function uploadToCloudinary(file, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const stream = new stream_1.PassThrough();
        stream.end(file.buffer);
        return new Promise((resolve, reject) => {
            const cloud = cloudinary_1.default.uploader.upload_stream({ folder }, (error, result) => {
                if (error || !result)
                    return reject(error);
                resolve({ secureUrl: result.secure_url, publicId: result.public_id });
            });
            stream.pipe(cloud);
        });
    });
}
