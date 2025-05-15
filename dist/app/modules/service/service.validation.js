"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceValidation = void 0;
const zod_1 = require("zod");
const serviceValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessUserId: zod_1.z.string().optional(),
        businessId: zod_1.z.string().optional(),
        serviceName: zod_1.z
            .string()
            .min(1, 'Service name is required')
            .max(100, 'Service name must be under 100 characters'),
        serviceDescription: zod_1.z
            .string()
            .min(1, 'Service description is required')
            .max(1000, 'Service description must be under 1000 characters'),
        servicePrice: zod_1.z.string().min(0, 'Service price must be a positive number').optional(),
    }),
    files: zod_1.z.object({
        serviceImage: zod_1.z
            .array(zod_1.z.object({ path: zod_1.z.string() }))
            .min(1, 'Image file is required'),
    }),
});
exports.serviceValidation = {
    serviceValidationSchema,
};
