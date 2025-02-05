import { z } from 'zod';


const serviceValidationSchema = z.object({
  body: z.object({
    businessUserId: z.string().optional(),
    businessId: z.string().optional(),
    serviceName: z
      .string()
      .min(1, 'Service name is required')
      .max(100, 'Service name must be under 100 characters'),
    serviceDescription: z
      .string()
      .min(1, 'Service description is required')
      .max(1000, 'Service description must be under 1000 characters'),
    servicePrice: z.string().min(0, 'Service price must be a positive number').optional(),
  }),
  files: z.object({
    serviceImage: z
      .array(z.object({ path: z.string() }))
      .min(1, 'Image file is required'),
  }),
});

export const serviceValidation = {
  serviceValidationSchema,
};
