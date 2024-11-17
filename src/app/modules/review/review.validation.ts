import { z } from 'zod';

// Zod schema for video validation
export const reviewSchema = z.object({
  body: z.object({
    title: z.string().nonempty('Title is required'),
    description: z.string().optional(),
    category: z.string().nonempty('Category is required'),
    videoUrl: z.string().url('Invalid video URL format'),
    thumbnailUrl: z.string().url('Invalid thumbnail URL format').optional(),
    views: z.number().min(0).default(0),
  }),
});

export const reviewValidation = {
  reviewSchema,
};
