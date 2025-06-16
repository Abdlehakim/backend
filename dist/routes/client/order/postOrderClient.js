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
const Client_1 = __importDefault(require("@/models/Client"));
const router = express_1.default.Router();
/**
 * POST /api/client/order/postOrderClient
 * Creates a new order for the authenticated user.
 */
router.post('/postOrderClient', authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1. Ensure there's a user ID from the token
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: User not found.' });
            return;
        }
        // 2. Extract fields from request body
        const { address, paymentMethod, selectedMethod, deliveryCost, totalDiscount, // optional from client side
        totalWithShipping, // used as 'total' in your schema
        items, } = req.body;
        if (!address || !paymentMethod || !items || !totalWithShipping) {
            res
                .status(400)
                .json({ error: 'Missing required fields in the request body.' });
            return;
        }
        // 3. (Optional) Ensure user exists
        const foundUser = yield Client_1.default.findById(userId).exec();
        if (!foundUser) {
            res
                .status(404)
                .json({ error: 'No matching user found for the provided token.' });
            return;
        }
        // 4. Create array of items matching 'orderItems' schema
        const orderItems = items.map((item) => {
            var _a, _b, _c;
            return ({
                product: item._id,
                refproduct: item.ref,
                name: item.name,
                quantity: item.quantity,
                tva: (_a = item.tva) !== null && _a !== void 0 ? _a : 0,
                image: (_b = item.imageUrl) !== null && _b !== void 0 ? _b : '',
                discount: (_c = item.discount) !== null && _c !== void 0 ? _c : 0,
                price: item.price,
            });
        });
        // 5. Create the new Order
        //  Notice we do NOT use <IOrder> here; we just do new Order({...})
        const newOrder = new order_1.default({
            user: userId,
            address,
            orderItems,
            paymentMethod,
            deliveryMethod: selectedMethod,
            deliveryCost: deliveryCost || 0,
            total: totalWithShipping,
            // 'ref' and other defaults set by schema or pre-save hook
        });
        // 6. Save
        const savedOrder = yield newOrder.save();
        // 7. Return success with the new ref
        res.status(200).json({ message: 'Order created', ref: savedOrder.ref });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res
            .status(500)
            .json({ error: 'Server error. Unable to create the order at this time.' });
    }
}));
exports.default = router;
