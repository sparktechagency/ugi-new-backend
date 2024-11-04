import { z } from 'zod';
import { Role, USER_ROLE } from './user.constants';

const guestValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Full Name is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    // Default role, adjust as necessary
    password: z.string({ required_error: 'Password is required' }),

  }),
});

export const userValidation = {
  guestValidationSchema,
};
