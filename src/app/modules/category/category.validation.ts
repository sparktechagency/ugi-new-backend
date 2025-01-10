import { z } from 'zod';

export const categorySchema = z.object({
  body: z.object({
    name: z.string().nonempty('Category name is required'),
  }),
  files: z.object({
    image: z
      .array(z.object({ path: z.string() })) // Validate file path
      .min(1, 'Image file is required'),
  }),
});

export const categoryValidation = {
  categorySchema,
};
