"use strict";
///api/dashboardadmin/orders/getAllOrders.ts
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
const order_1 = __importDefault(require("@/models/order"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = express_1.default.Router();
/**
 * GET /api/dashboardadmin/orders
 * Returns all orders with populated user and address.
 */
router.get('/', (0, requireDashboardPermission_1.requirePermission)('M_Access'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_1.default.find()
            .populate('user', '-password')
            .populate('address');
        res.status(200).json({ orders });
    }
    catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
