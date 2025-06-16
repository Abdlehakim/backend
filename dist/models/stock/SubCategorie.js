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
// models/SubCategorie.ts
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const generateSubCategorieRef = () => {
    const prefix = 'sc';
    const suffix = crypto_1.default
        .randomBytes(3)
        .toString('hex')
        .toLowerCase();
    return prefix + suffix;
};
const slugifySubCategorieName = (name) => name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
const SubCategorieSchema = new mongoose_1.Schema({
    reference: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    iconUrl: { type: String, default: null, required: true },
    iconId: { type: String, default: null },
    imageUrl: { type: String, default: null, required: true },
    imageId: { type: String, default: null },
    bannerUrl: { type: String, default: null, required: true },
    bannerId: { type: String, default: null },
    vadmin: { type: String, default: 'not-approve' },
    categorie: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Categorie', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DashboardUser', required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DashboardUser' },
}, { timestamps: true });
// Auto-generate a unique "scXXXXXX" reference before validation
SubCategorieSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            let ref;
            let exists;
            do {
                ref = generateSubCategorieRef();
                exists = yield mongoose_1.default.models.SubCategorie.findOne({ reference: ref });
            } while (exists);
            this.reference = ref;
        }
        next();
    });
});
// Slugify on name change
SubCategorieSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugifySubCategorieName(this.name);
    }
    next();
});
// Virtual to count products in this subcategory
SubCategorieSchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'subcategorie',
    count: true
});
// Include virtuals when converting to JSON or objects
SubCategorieSchema.set('toJSON', { virtuals: true });
SubCategorieSchema.set('toObject', { virtuals: true });
const SubCategorie = mongoose_1.default.models.SubCategorie ||
    mongoose_1.default.model('SubCategorie', SubCategorieSchema);
exports.default = SubCategorie;
