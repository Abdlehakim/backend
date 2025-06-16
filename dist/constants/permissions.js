"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = void 0;
exports.isValidPermission = isValidPermission;
// src/constants/permissions.ts
exports.PERMISSIONS = {
    /* MANAGE_DASHBOARD_USERS: 'M_Access', */
    MANAGE_Access: 'M_Access',
    MANAGE_WebsiteData: 'M_WebsiteData',
    MANAGE_Stock: 'M_Stock',
    MANAGE_Blog: 'M_Blog',
};
function isValidPermission(key) {
    return Object.values(exports.PERMISSIONS).includes(key);
}
