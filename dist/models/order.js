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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const OrderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    ref: { type: String },
    address: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    orderItems: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            refproduct: { type: String, required: true },
            name: { type: String, required: true },
            tva: { type: Number, default: 0 },
            quantity: { type: Number, required: true },
            image: { type: String, default: '' },
            discount: { type: Number, default: 0 },
            price: { type: Number, required: true },
        },
    ],
    paymentMethod: { type: String },
    deliveryMethod: { type: String, required: true },
    deliveryCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderStatus: { type: String, default: 'Processing' },
    statustimbre: { type: Boolean, default: true },
    statusinvoice: { type: Boolean, default: false },
}, { timestamps: true });
// Pre-save hook to generate random `ref` if not provided
OrderSchema.pre('save', function (next) {
    if (!this.ref) {
        this.ref = `ORDER-${crypto_1.default.randomBytes(4).toString('hex')}`;
    }
    next();
});
const Order = mongoose_1.default.models.Order || mongoose_1.default.model('Order', OrderSchema);
exports.default = Order;
