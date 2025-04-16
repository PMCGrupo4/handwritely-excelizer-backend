"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const init_1 = require("./utils/init");
dotenv_1.default.config();
(0, init_1.initializeDirectories)();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/auth', auth_routes_1.default);
app.use('/api', auth_middleware_1.authenticateToken);
app.use('/api/ocr', ocr_routes_1.default);
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map