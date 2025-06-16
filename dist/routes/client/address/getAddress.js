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
const Address_1 = __importDefault(require("@/models/Address"));
const authenticateToken_1 = require("@/middleware/authenticateToken");
const router = express_1.default.Router();
// GET /api/client/address/getAddress
router.get("/getAddress", authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: User not found." });
            return;
        }
        // Sort by 'createdAt' in descending order to show the latest address first
        const addresses = yield Address_1.default.find({ client: userId })
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(addresses);
    }
    catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}));
exports.default = router;
