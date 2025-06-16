"use strict";
// src/models/blog/Post.ts
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
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
/* helpers */
const generatePostReference = () => 'ps' + crypto_1.default.randomBytes(3).toString('hex').toLowerCase();
const slugify = (s) => s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
/* recursive subsection schema */
const SubsectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    // Images in subsections are optional
    imageUrl: { type: String, },
    imageId: { type: String, },
}, { _id: true });
SubsectionSchema.add({ children: { type: [SubsectionSchema], default: [] } });
/* main post schema */
const PostSchema = new mongoose_1.Schema({
    title: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    // Main section image is required
    imageUrl: { type: String, required: true },
    imageId: { type: String, required: true },
    reference: { type: String, required: true, unique: true, index: true },
    slug: { type: String, unique: true },
    vadmin: {
        type: String,
        enum: ['not-approve', 'approve'],
        default: 'not-approve',
    },
    postCategorie: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PostCategorie',
        required: true,
    },
    postSubCategorie: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PostSubCategorie',
        default: null,
    },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DashboardUser', required: true },
    subsections: { type: [SubsectionSchema], default: [] },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DashboardUser', required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DashboardUser', default: null },
}, { timestamps: true });
/* pre-validate hook: generate reference */
PostSchema.pre('validate', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            let ref;
            let exists;
            do {
                ref = generatePostReference();
                exists = yield mongoose_1.default.models.Post.findOne({ reference: ref });
            } while (exists);
            this.reference = ref;
        }
        next();
    });
});
/* pre-save hook: slugify title */
PostSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title);
    }
    next();
});
/* static method: count comments */
PostSchema.statics.commentCount = function (postId) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongoose_1.default.model('PostComment').countDocuments({ post: postId });
    });
};
// Include virtuals and statics in JSON output
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });
// Export model with static
const Post = mongoose_1.default.models.Post ||
    mongoose_1.default.model('Post', PostSchema);
exports.default = Post;
