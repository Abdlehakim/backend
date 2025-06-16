"use strict";
// models/websitedata/companyData.ts
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const companyDataSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    bannerImageUrl: {
        type: String,
        required: true,
    },
    bannerImageId: {
        type: String,
        required: true,
    },
    logoImageUrl: {
        type: String,
        required: true,
    },
    logoImageId: {
        type: String,
        required: true,
    },
    contactBannerUrl: {
        type: String,
        required: false,
    },
    contactBannerId: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    zipcode: {
        type: String,
        required: true,
        trim: true,
    },
    governorate: {
        type: String,
        required: true,
        trim: true,
    },
    facebook: {
        type: String,
        trim: true,
    },
    linkedin: {
        type: String,
        trim: true,
    },
    instagram: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
// Prevent creating more than one document
companyDataSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const Model = this.constructor;
        if (this.isNew) {
            const count = yield Model.countDocuments();
            if (count > 0) {
                return next(new Error('CompanyData already exists. Use update instead.'));
            }
        }
        next();
    });
});
const CompanyData = mongoose_1.default.models.CompanyData ||
    mongoose_1.default.model('CompanyData', companyDataSchema);
exports.default = CompanyData;
