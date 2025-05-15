"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryValidation = exports.categorySchema = void 0;
const zod_1 = require("zod");
exports.categorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().nonempty('Category name is required'),
    }),
    files: zod_1.z.object({
        image: zod_1.z
            .array(zod_1.z.object({ path: zod_1.z.string() })) // Validate file path
            .min(1, 'Image file is required'),
    }),
});
exports.categoryValidation = {
    categorySchema: exports.categorySchema,
};
