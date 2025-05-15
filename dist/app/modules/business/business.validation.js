"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessValidation = void 0;
const zod_1 = require("zod");
const businessValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessId: zod_1.z.string().min(1, 'User ID is required'),
        businessName: zod_1.z.string().min(1, 'Business name is required'),
        businessType: zod_1.z.array(zod_1.z.string()),
        businessDescription: zod_1.z.string().min(1, 'Business description is required'),
        paymentMethod: zod_1.z.enum(['Card', 'Cash', 'Cash & Card'], {
            errorMap: () => ({
                message: 'Payment method must be one of Card, Cash, or Cash & Card',
            }),
        }),
    }),
    files: zod_1.z.object({
        businessImage: zod_1.z
            .array(zod_1.z.object({ path: zod_1.z.string() }))
            .min(1, 'Business image file is required'),
    }),
});
const daysOfWeek = zod_1.z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
]);
const businessAvailableTimeValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        availableDays: zod_1.z
            .array(daysOfWeek)
            .nonempty('Available days are required')
            .refine((days) => new Set(days).size === days.length, {
            message: 'Available days must not contain duplicates',
        }),
        businessStartTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"')
            .default('09:00 AM'),
        businessEndTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"')
            .default('05:00 PM'),
        specialDays: zod_1.z.array(daysOfWeek).optional(),
        specialStartTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"'),
        specialEndTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"'),
        bookingBreak: zod_1.z.string().min(1, 'Booking break is required').default('10'),
        launchbreakStartTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"')
            .default('01:00 PM'),
        launchbreakEndTime: zod_1.z
            .string()
            .regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/, 'Invalid time format. Expected format is "00:00 AM" or "00:00 PM"')
            .default('02:00 PM'),
    }),
});
exports.businessValidation = {
    businessValidationSchema,
    businessAvailableTimeValidationSchema,
};
