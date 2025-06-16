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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debugging line
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("./models/stock/Product"));
const updateProductsWithReviews = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connecting to MongoDB...');
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        const result = yield Product_1.default.updateMany({}, { $set: { reviews: [] } });
        console.log(`Updated ${result.modifiedCount} products with the new 'reviews' field.`);
    }
    catch (error) {
        console.error('Error updating products:', error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
});
updateProductsWithReviews();
