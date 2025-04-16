"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandService = void 0;
const supabase_1 = require("../config/supabase");
const uuid_1 = require("uuid");
class CommandService {
    async createCommand(ocrResult) {
        var _a, _b;
        const commandId = (0, uuid_1.v4)();
        const userId = ocrResult.user_id;
        if (!userId) {
            throw new Error('User ID is required');
        }
        const { data, error } = await supabase_1.supabase
            .from('commands')
            .insert({
            id: commandId,
            user_id: userId,
            items: ((_a = ocrResult.receipt) === null || _a === void 0 ? void 0 : _a.items) || [],
            total: ((_b = ocrResult.receipt) === null || _b === void 0 ? void 0 : _b.total) || 0,
            status: 'completed'
        })
            .then(({ error: insertError }) => {
            if (insertError)
                throw insertError;
            return supabase_1.supabase
                .from('commands')
                .select('*')
                .eq('id', commandId)
                .single();
        });
        if (error) {
            throw new Error(`Failed to create command: ${error.message}`);
        }
        return data;
    }
    async getCommand(id) {
        const { data, error } = await supabase_1.supabase
            .from('commands')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(`Failed to get command: ${error.message}`);
        }
        return data;
    }
    async deleteCommand(id) {
        const { error } = await supabase_1.supabase
            .from('commands')
            .delete()
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to delete command: ${error.message}`);
        }
    }
}
exports.CommandService = CommandService;
//# sourceMappingURL=command.service.js.map