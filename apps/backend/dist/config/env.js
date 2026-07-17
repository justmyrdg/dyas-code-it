"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const backendRoot = path_1.default.resolve(__dirname, '..', '..');
const workspaceRoot = path_1.default.resolve(backendRoot, '..', '..');
for (const envPath of [
    path_1.default.join(backendRoot, '.env'),
    path_1.default.join(workspaceRoot, '.env'),
]) {
    if ((0, fs_1.existsSync)(envPath)) {
        dotenv_1.default.config({ path: envPath });
    }
}
//# sourceMappingURL=env.js.map