"use strict";
// scripts/initRoles.ts
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
exports.initializeDefaultRoles = initializeDefaultRoles;
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const Permission_1 = __importDefault(require("@/models/dashboardadmin/Permission"));
/**
 * Creates or updates the "SuperAdmin" role with all permissions.
 * Clears permissions for all other roles unconditionally.
 */
function initializeDefaultRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        const allPermissionDocs = yield Permission_1.default.find({});
        const allPermissionKeys = allPermissionDocs.map((doc) => doc.key);
        const superAdminData = {
            name: 'SuperAdmin',
            description: 'The super admin role (only one allowed)',
            permissions: allPermissionKeys,
        };
        // Handle SuperAdmin role
        let superAdminRole = yield DashboardRole_1.default.findOne({ name: superAdminData.name });
        if (!superAdminRole) {
            superAdminRole = new DashboardRole_1.default(superAdminData);
            yield superAdminRole.save();
            console.log(`✅ Created default role: ${superAdminData.name}`);
        }
        else {
            superAdminRole.description = superAdminData.description;
            superAdminRole.permissions = superAdminData.permissions;
            yield superAdminRole.save();
            console.log(`🔄 Updated existing role: ${superAdminData.name}`);
        }
        // Clear permissions for all other roles
        const otherRoles = yield DashboardRole_1.default.find({ name: { $ne: 'SuperAdmin' } });
        for (const role of otherRoles) {
            role.permissions = [];
            yield role.save();
            console.log(`🧹 Cleared permissions for role: ${role.name}`);
        }
    });
}
