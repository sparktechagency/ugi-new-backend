import { z } from 'zod';

// Zod schema for TSubCategory
export const subCategorySchema = z.object({
  body: z.object({
    subCategoryname: z.string().min(1, 'Sub-category name is required'),
    categoryName: z.string().min(1, 'Category name is required'),
    categoryId: z
      .string()
      .min(1, 'Category ID is required'), // Validates MongoDB ObjectId
  }),
});

export const subCategoryValidation = {
  subCategorySchema,
};
