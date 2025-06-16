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
// DELETE /api/client/address/deleteAddress/:id - Delete an address
router.delete("/deleteAddress/:id", authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Find the address belonging to the authenticated user using the 'client' field
        const address = yield Address_1.default.findOne({ _id: id, client: userId });
        if (!address) {
            res.status(404).json({ error: "Address not found" });
            return;
        }
        yield address.deleteOne(); // Use deleteOne instead of remove
        res.status(200).json({ message: "Address deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
