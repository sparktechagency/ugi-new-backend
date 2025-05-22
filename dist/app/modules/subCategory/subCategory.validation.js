"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subCategoryValidation = exports.subCategorySchema = void 0;
const zod_1 = require("zod");
// Zod schema for TSubCategory
exports.subCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        subCategoryname: zod_1.z.string().min(1, 'Sub-category name is required'),
        categoryName: zod_1.z.string().min(1, 'Category name is required'),
        categoryId: zod_1.z
            .string()
            .min(1, 'Category ID is required'), // Validates MongoDB ObjectId
    }),
});
exports.subCategoryValidation = {
    subCategorySchema: exports.subCategorySchema,
};
