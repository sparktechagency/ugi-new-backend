"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const guestValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z
            .string({ required_error: 'Full Name is required' }),
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email({ message: 'Invalid email address' }),
        // Default role, adjust as necessary
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
exports.userValidation = {
    guestValidationSchema,
};
