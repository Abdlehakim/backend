"use strict";
// models/websitedata/homePageData.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const homePageDataSchema = new mongoose_1.Schema({
    HPbannerImgUrl: { type: String, required: true, unique: true },
    HPbannerImgId: { type: String, required: true, unique: true },
    HPbannerTitle: { type: String, required: true, unique: true },
    HPcategorieTitle: { type: String, required: true, unique: true },
    HPcategorieSubTitle: { type: String, required: true, unique: true },
    HPbrandTitle: { type: String, required: true, unique: true },
    HPbrandSubTitle: { type: String, required: true, unique: true },
    HPboutiqueTitle: { type: String, required: true, unique: true },
    HPboutiqueSubTitle: { type: String, required: true, unique: true },
    HPNewProductTitle: { type: String, required: true, unique: true },
    HPNewProductSubTitle: { type: String, required: true, unique: true },
    HPPromotionTitle: { type: String, required: true, unique: true },
    HPPromotionSubTitle: { type: String, required: true, unique: true },
    HPBestCollectionTitle: { type: String, required: true, unique: true },
    HPBestCollectionSubTitle: { type: String, required: true, unique: true },
}, { timestamps: true });
const HomePageData = mongoose_1.default.models.HomePageData ||
    mongoose_1.default.model('HomePageData', homePageDataSchema);
exports.default = HomePageData;
