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
const Client_1 = __importDefault(require("@/models/Client"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = express_1.default.Router();
/**
 * DELETE /api/dashboardadmin/client/delete/:id
 * Delete a client by ID.
 */
router.delete('/delete/:id', (0, requireDashboardPermission_1.requirePermission)('M_Access'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const client = yield Client_1.default.findByIdAndDelete(id);
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    }
    catch (error) {
        console.error('Delete Client Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
