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
 * GET /api/client/order/getOrderByRef/:ref
 * Retrieves a single order by its reference for the authenticated user.
 */
router.get('/getOrderByRef/:ref', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1. Get user ID from token
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: User not found.' });
            return;
        }
        // 2. Grab the 'ref' from the route params
        const { ref } = req.params;
        if (!ref) {
            res.status(400).json({ error: 'Order reference is required in the URL.' });
            return;
        }
        // 4. Find the order by ref (and optionally populate the address)
        const order = yield order_1.default.findOne({ ref }).populate('address');
        if (!order) {
            res.status(404).json({ error: `No order found with ref '${ref}'` });
            return;
        }
        // 5. Optionally ensure the order belongs to this user
        //    (only if you want to enforce that a user can see only their own orders)
        if (order.user.toString() !== userId.toString()) {
            res.status(403).json({ error: 'You do not have permission to view this order.' });
            return;
        }
        // 6. Return the order
        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error retrieving order:', error);
        res
            .status(500)
            .json({ error: 'Server error. Unable to retrieve the order at this time.' });
    }
}));
exports.default = router;
