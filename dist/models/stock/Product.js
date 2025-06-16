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
// src/models/stock/Product.ts
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
/* helpers */
const generateProductReference = () => "pr" + crypto_1.default.randomBytes(3).toString("hex").toLowerCase();
const slugify = (n) => n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
/* schema */
const ProductSchema = new mongoose_1.Schema({
    /* basic */
    name: { type: String, unique: true, required: true },
    info: { type: String },
    description: { type: String },
    reference: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    categorie: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Categorie",
        required: true,
    },
    subcategorie: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "SubCategorie",
        default: null,
    },
    boutique: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Boutique",
        default: null,
    },
    brand: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Brand",
        default: null,
    },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    tva: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stockStatus: {
        type: String,
        enum: ["in stock", "out of stock"],
        default: "in stock",
    },
    statuspage: {
        type: String,
        enum: ["none", "New-Products", "promotion", "best-collection"],
        default: "none",
    },
    vadmin: {
        type: String,
        enum: ["not-approve", "approve"],
        default: "not-approve",
    },
    /* images */
    mainImageUrl: { type: String, required: true },
    mainImageId: { type: String, default: null },
    extraImagesUrl: { type: [String], default: [] },
    extraImagesId: { type: [String], default: [] },
    /* ratings */
    nbreview: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    /* users */
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "DashboardUser",
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "DashboardUser",
        default: null,
    },
    /* dynamic attributes */
    attributes: [
        {
            attributeSelected: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "ProductAttribute",
            },
            value: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true,
                validate: {
                    validator: (v) => {
                        // plain string
                        if (typeof v === "string") {
                            return v.trim().length > 0;
                        }
                        // array of pairs
                        if (Array.isArray(v)) {
                            return (v.length > 0 &&
                                v.every((p) => {
                                    if (typeof p !== "object" ||
                                        !p.name ||
                                        typeof p.name !== "string" ||
                                        !p.name.trim()) {
                                        return false;
                                    }
                                    // dimension/other type
                                    if ("value" in p) {
                                        return (typeof p.value === "string" && p.value.trim().length > 0);
                                    }
                                    // color type
                                    if ("hex" in p) {
                                        return (typeof p.hex === "string" && p.hex.trim().length > 0);
                                    }
                                    return false;
                                }));
                        }
                        // fallback object
                        if (typeof v === "object" && v !== null) {
                            return (Object.keys(v).length > 0 &&
                                Object.values(v).every((val) => typeof val === "string" && val.trim().length > 0));
                        }
                        return false;
                    },
                    message: "Attribute value must be non-empty.",
                },
            },
        },
    ],
    /* productDetails */
    productDetails: [
        {
            name: { type: String, required: true, trim: true },
            description: { type: String, default: null, trim: true },
        },
    ],
}, { timestamps: true });
/* pre-validate hook: generate unique reference */
ProductSchema.pre("validate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            let ref;
            let exists;
            do {
                ref = generateProductReference();
                exists = yield mongoose_1.default.models.Product.findOne({ reference: ref });
            } while (exists);
            this.reference = ref;
        }
        next();
    });
});
/* pre-save hook: slugify name */
ProductSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();
});
/* virtual count of reviews */
ProductSchema.virtual("reviewCount", {
    ref: "Review",
    localField: "_id",
    foreignField: "product",
    count: true,
});
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });
const Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", ProductSchema);
exports.default = Product;
