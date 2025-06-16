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
const Address_1 = __importDefault(require("@/models/Address")); // Adjust the path as needed
const router = express_1.default.Router();
// POST /api/client/address/postAddress
router.post("/PostAddress", authenticateToken_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destructure the required fields from the request body
        const { Name, StreetAddress, Country, Province, City, PostalCode } = req.body;
        // Use the authenticated user's id as the client
        const clientId = req.user.id;
        // Create a new address instance
        const newAddress = new Address_1.default({
            Name,
            StreetAddress,
            Country,
            Province,
            City,
            PostalCode,
            client: clientId,
        });
        // Save the address to the database
        const savedAddress = yield newAddress.save();
        // Send the newly created address
        res.status(201).json(savedAddress);
    }
    catch (error) {
        console.error("Error creating address:", error);
        res.status(500).json({ error: "Server error while creating address" });
    }
}));
exports.default = router;
