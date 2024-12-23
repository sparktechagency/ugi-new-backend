import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';

import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import paymentRouter from '../modules/payment/payment.route';
import reviewRouter from '../modules/review/review.route';
import walletRouter from '../modules/wallet/wallet.route';
import withdrawRouter from '../modules/withdraw/withdraw.route';
import cencelBookingRoutes from '../modules/cencelBooking/cencelBooking.route';
import serviceBookingRoutes from '../modules/serviceBooking/serviceBooking.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/setting',
    route: settingsRouter,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  {
    path: '/review',
    route: reviewRouter,
  },

  {
    path: '/wallet',
    route: walletRouter,
  },
  {
    path: '/payment',
    route: paymentRouter,
  },
  {
    path: '/withdraw',
    route: withdrawRouter,
  },
  {
    path: '/service-booking',
    route: serviceBookingRoutes,
  },
  {
    path: '/cencel-booking',
    route: cencelBookingRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
