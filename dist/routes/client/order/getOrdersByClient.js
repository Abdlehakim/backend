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
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("@/middleware/authenticateToken");
const order_1 = __importDefault(require("@/models/order"));
const router = express_1.default.Router();
/**
 * GET /api/order/getOrdersByClient
 * Retrieves all orders associated with the authenticated client.
 */
router.get('/getOrdersByClient', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1. Extract user ID from the token
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: User not found.' });
            return;
        }
        // 2. Query the database for orders belonging to this user, sorted by creation date (newest first)
        const orders = yield order_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
        // 3. Return the orders in the response
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({
            error: 'Server error. Unable to retrieve orders at this time.',
        });
    }
}));
exports.default = router;
