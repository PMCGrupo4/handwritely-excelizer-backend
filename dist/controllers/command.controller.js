"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandController = void 0;
const command_service_1 = require("../services/command.service");
class CommandController {
    constructor() {
        this.commandService = new command_service_1.CommandService();
    }
    async createCommand(req, res) {
        try {
            const ocrResult = req.body;
            const command = await this.commandService.createCommand(ocrResult);
            return res.status(201).json(command);
        }
        catch (error) {
            console.error('Error creating command:', error);
            return res.status(500).json({ error: 'Failed to create command' });
        }
    }
    async getCommand(req, res) {
        try {
            const { id } = req.params;
            const command = await this.commandService.getCommand(id);
            if (!command) {
                return res.status(404).json({ error: 'Command not found' });
            }
            return res.json(command);
        }
        catch (error) {
            console.error('Error getting command:', error);
            return res.status(500).json({ error: 'Failed to get command' });
        }
    }
    async deleteCommand(req, res) {
        try {
            const { id } = req.params;
            await this.commandService.deleteCommand(id);
            return res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting command:', error);
            return res.status(500).json({ error: 'Failed to delete command' });
        }
    }
}
exports.CommandController = CommandController;
//# sourceMappingURL=command.controller.js.map