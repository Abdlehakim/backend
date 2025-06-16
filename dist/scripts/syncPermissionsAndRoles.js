"use strict";
// scripts/syncPermissionsAndRoles.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createOrUpdatePermissions_1 = require("./createOrUpdatePermissions");
const initRoles_1 = require("./initRoles");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const changesMade = yield (0, createOrUpdatePermissions_1.createOrUpdatePermissions)();
    if (changesMade) {
        yield (0, initRoles_1.initializeDefaultRoles)();
    }
    else {
        console.log('🟡 Skipped SuperAdmin role update – no permission changes detected.');
    }
}))();
