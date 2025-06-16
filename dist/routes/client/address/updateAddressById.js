"use strict";
// updateAddressById.ts
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
const express_1 = require("express");
const Address_1 = __importDefault(require("@/models/Address"));
const authenticateToken_1 = require("@/middleware/authenticateToken");
const router = (0, express_1.Router)();
// PUT /api/client/address/updateAddress/:id
router.put('/updateAddress/:id', authenticateToken_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const address = yield Address_1.default.findOne({ _id: id, client: userId });
        if (!address) {
            res.status(404).json({ error: 'Address not found' });
            return;
        }
        address.Name = (_b = req.body.Name) !== null && _b !== void 0 ? _b : address.Name;
        address.StreetAddress = (_c = req.body.StreetAddress) !== null && _c !== void 0 ? _c : address.StreetAddress;
        address.Country = (_d = req.body.Country) !== null && _d !== void 0 ? _d : address.Country;
        address.Province = (_e = req.body.Province) !== null && _e !== void 0 ? _e : address.Province;
        address.City = (_f = req.body.City) !== null && _f !== void 0 ? _f : address.City;
        address.PostalCode = (_g = req.body.PostalCode) !== null && _g !== void 0 ? _g : address.PostalCode;
        yield address.save();
        res.status(200).json({ message: 'Address updated successfully', address });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
