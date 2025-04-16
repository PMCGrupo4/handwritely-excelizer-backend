"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const command_controller_1 = require("../controllers/command.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const commandController = new command_controller_1.CommandController();
router.use(auth_middleware_1.authenticateToken);
router.post('/', (req, res) => commandController.createCommand(req, res));
router.get('/:id', (req, res) => commandController.getCommand(req, res));
router.delete('/:id', (req, res) => commandController.deleteCommand(req, res));
exports.default = router;
//# sourceMappingURL=command.routes.js.map