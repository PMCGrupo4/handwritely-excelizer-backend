"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDirectories = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const initializeDirectories = () => {
    const uploadsDir = path_1.default.join(__dirname, '../../uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        console.log('Directorio de uploads creado:', uploadsDir);
    }
};
exports.initializeDirectories = initializeDirectories;
//# sourceMappingURL=init.js.map