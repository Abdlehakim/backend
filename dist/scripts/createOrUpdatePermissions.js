"use strict";
// scripts/createOrUpdatePermissions.ts
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
exports.createOrUpdatePermissions = createOrUpdatePermissions;
const Permission_1 = __importDefault(require("@/models/dashboardadmin/Permission"));
const permissions_1 = require("@/constants/permissions");
/**
 * Synchronize permission constants with the database.
 * Returns true if any change was made.
 */
function createOrUpdatePermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        const permissionKeys = Object.values(permissions_1.PERMISSIONS);
        let changesMade = false;
        for (const key of permissionKeys) {
            const exists = yield Permission_1.default.exists({ key });
            if (!exists) {
                yield Permission_1.default.create({ key });
                console.log(`Inserted new permission: ${key}`);
                changesMade = true;
            }
        }
        const dbPermissions = yield Permission_1.default.find({});
        for (const dbPermission of dbPermissions) {
            if (!(0, permissions_1.isValidPermission)(dbPermission.key)) {
                yield Permission_1.default.deleteOne({ _id: dbPermission._id });
                console.log(`Removed stale permission: ${dbPermission.key}`);
                changesMade = true;
            }
        }
        if (changesMade) {
            console.log('✅ Permissions synced with database.');
        }
        else {
            console.log('✅ No permission changes needed. Skipped update.');
        }
        return changesMade;
    });
}
