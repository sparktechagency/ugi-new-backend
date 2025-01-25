import { z } from 'zod';

 const businessValidationSchema = z.object({
   body: z.object({
     businessId: z.string().min(1, 'User ID is required'),
     businessName: z.string().min(1, 'Business name is required'),
     businessType: z.array(z.string()),
     businessDescription: z.string().min(1, 'Business description is required'),
     paymentMethod: z.enum(['Card', 'Cash', 'Cash & Card'], {
       errorMap: () => ({
         message: 'Payment method must be one of Card, Cash, or Cash & Card',
       }),
     }),
   }),
   files: z.object({
     businessImage: z
       .array(z.object({ path: z.string() }))
       .min(1, 'Business image file is required'),
   }),
 });


const daysOfWeek = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

 const businessAvailableTimeValidationSchema = z.object({
   body: z.object({
     availableDays: z
       .array(daysOfWeek)
       .nonempty('Available days are required')
       .refine((days) => new Set(days).size === days.length, {
         message: 'Available days must not contain duplicates',
       }),
     businessStartTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       )
       .default('09:00 AM'),
     businessEndTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       )
       .default('05:00 PM'),
       specialDays: z.array(daysOfWeek).optional(),
       specialStartTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       ),
       specialEndTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       ),
     bookingBreak: z.string().min(1, 'Booking break is required').default('10'),
     launchbreakStartTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       )
       .default('01:00 PM'),
     launchbreakEndTime: z
       .string()
       .regex(
         /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/,
         'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"',
       )
       .default('02:00 PM'),
   }),
   
 });

export const businessValidation = {
  businessValidationSchema,
  businessAvailableTimeValidationSchema,
};