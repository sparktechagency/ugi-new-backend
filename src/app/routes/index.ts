import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';

import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import paymentRouter from '../modules/payment/payment.route';
// import walletRouter from '../modules/wallet/wallet.route';
import withdrawRouter from '../modules/withdraw/withdraw.route';
// import cencelBookingRoutes from '../modules/cencelBooking/cencelBooking.route';
import serviceBookingRoutes from '../modules/serviceBooking/serviceBooking.route';
import categoryRouter from '../modules/category/category.route';
import subCategoryRouter from '../modules/subCategory/subCategory.route';
import businessRouter from '../modules/business/business.route';
import serviceRouter from '../modules/service/service.route';
import ugiTokenRouter from '../modules/ugiToken/ugiToken.route';
import favoriteBusinessRoutes from '../modules/favorite/favorite.route';
import reviewRouter from '../modules/ratings/ratings.route';
import chatRouter from '../modules/chat/chat.route';
import messageRouter from '../modules/message/message.route';

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
  // {
  //   path: '/wallet',
  //   route: walletRouter,
  // },
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
  // {
  //   path: '/cencel-booking',
  //   route: cencelBookingRoutes,
  // },
  {
    path: '/category',
    route: categoryRouter,
  },
  {
    path: '/sub-category',
    route: subCategoryRouter,
  },
  {
    path: '/business',
    route: businessRouter,
  },
  {
    path: '/service',
    route: serviceRouter,
  },
  {
    path: '/ugi-token',
    route: ugiTokenRouter,
  },
  {
    path: '/favorite-business',
    route: favoriteBusinessRoutes,
  },
  {
    path: '/review',
    route: reviewRouter,
  },
  {
    path: '/chat',
    route: chatRouter,
  },
  {
    path: '/message',
    route: messageRouter,
  }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
