"use strict";
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
// models/specialPageBanner.ts
const mongoose_1 = __importStar(require("mongoose"));
const SpecialPageBannerSchema = new mongoose_1.Schema({
    /* ------------------------ Best-Collection ------------------------- */
    BCbannerImgUrl: {
        type: String,
        required: true,
        unique: true,
    },
    BCbannerImgId: {
        type: String,
        required: true,
        unique: true,
    },
    BCbannerTitle: {
        type: String,
        required: true,
        unique: true,
    },
    /* --------------------------- Promotion ---------------------------- */
    PromotionBannerImgUrl: {
        type: String,
        required: true,
        unique: true,
    },
    PromotionBannerImgId: {
        type: String,
        required: true,
        unique: true,
    },
    PromotionBannerTitle: {
        type: String,
        required: true,
        unique: true,
    },
    /* ------------------------ New-Products --------------------------- */
    NPBannerImgUrl: {
        type: String,
        required: true,
        unique: true,
    },
    NPBannerImgId: {
        type: String,
        required: true,
        unique: true,
    },
    NPBannerTitle: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });
const SpecialPageBanner = mongoose_1.default.models.SpecialPageBanner ||
    mongoose_1.default.model('SpecialPageBanner', SpecialPageBannerSchema);
exports.default = SpecialPageBanner;
