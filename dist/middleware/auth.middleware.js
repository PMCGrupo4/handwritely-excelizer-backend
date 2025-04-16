"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const supabase_1 = require("../config/supabase");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No token provided' });
            return Promise.resolve();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Invalid token format' });
            return Promise.resolve();
        }
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({ error: 'Invalid token' });
            return Promise.resolve();
        }
        req.user = user;
        next();
        return Promise.resolve();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return Promise.resolve();
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.middleware.js.map