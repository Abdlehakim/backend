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
exports.uploadImagesToCloudinary = uploadImagesToCloudinary;
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("./cloudinary"));
function uploadImagesToCloudinary(imageFiles_1) {
    return __awaiter(this, arguments, void 0, function* (imageFiles, folder = "Products/images") {
        return Promise.all(imageFiles.map((file, i) => {
            const passthrough = new stream_1.PassThrough();
            passthrough.end(file.buffer);
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder /*, format: "webp" if you really need it */ }, (error, result) => {
                    if (error || !result) {
                        return reject(new Error(`Image ${i + 1} (${file.originalname}) failed: ${error === null || error === void 0 ? void 0 : error.message}`));
                    }
                    resolve({ secureUrl: result.secure_url, publicId: result.public_id });
                });
                passthrough.pipe(stream);
            });
        }));
    });
}
