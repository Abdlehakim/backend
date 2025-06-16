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
// initSuperAdmin.ts
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
function createSuperAdminAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Retrieve the SuperAdmin role document
            const superAdminRole = yield DashboardRole_1.default.findOne({ name: 'SuperAdmin' });
            if (!superAdminRole) {
                console.error("SuperAdmin role not found. Please ensure you have initialized default roles.");
                return;
            }
            // Check if a user with the SuperAdmin role already exists
            const existingSuperAdmin = yield DashboardUser_1.default.findOne({ role: superAdminRole._id });
            if (existingSuperAdmin) {
                console.log("SuperAdmin account already exists. Skipping creation.");
                return;
            }
            // Define credentials for the SuperAdmin account (use env variables or defaults)
            const email = process.env.SUPER_ADMIN_EMAIL;
            const password = process.env.SUPER_ADMIN_PASSWORD;
            const username = process.env.SUPER_ADMIN_USERNAME;
            const phone = process.env.SUPER_ADMIN_PHONE;
            const newSuperAdmin = new DashboardUser_1.default({
                email,
                password,
                username,
                phone,
                role: superAdminRole._id,
            });
            yield newSuperAdmin.save();
            console.log("SuperAdmin account created successfully.");
        }
        catch (error) {
            console.error("Error creating SuperAdmin account:", error);
        }
    });
}
exports.default = createSuperAdminAccount;
