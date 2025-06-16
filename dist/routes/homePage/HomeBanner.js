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
// src/routes/websiteInfo.ts
const express_1 = require("express");
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const router = (0, express_1.Router)();
// GET /api/HomePageBanner
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const websiteInfo = yield homePageData_1.default.findOne({}).select("HPbannerTitle HPbannerImgUrl")
            .exec();
        // Check if no data was found
        if (!websiteInfo) {
            res.status(404).json({ error: 'No website info found' });
            return;
        }
        // Return the formatted data
        res.json(websiteInfo);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching website info' });
    }
}));
exports.default = router;
