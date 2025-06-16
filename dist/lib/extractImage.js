"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extractPublicId = (url) => {
    const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|svg|webp)$/);
    if (matches) {
        return matches[1];
    }
    const segments = url.split("/");
    const lastSegment = segments.pop();
    return lastSegment ? lastSegment.split(".")[0] : "";
};
exports.default = extractPublicId;
