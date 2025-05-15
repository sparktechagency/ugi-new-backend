"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueToken = void 0;
const generateUniqueToken = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
};
exports.generateUniqueToken = generateUniqueToken;
