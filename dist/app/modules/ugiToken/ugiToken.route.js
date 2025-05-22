"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ugiToken_controller_1 = require("./ugiToken.controller");
const ugiTokenRouter = express_1.default.Router();
ugiTokenRouter
    .post('/create-ugi-token', 
// auth(USER_ROLE.ADMIN),
ugiToken_controller_1.ugiTokenController.createUgiToken)
    .get('/', ugiToken_controller_1.ugiTokenController.getSingleUgiToken)
    .patch('/:id', 
// auth(USER_ROLE.BUSINESS),
ugiToken_controller_1.ugiTokenController.updateUgiTokenAcceptCencel);
exports.default = ugiTokenRouter;
