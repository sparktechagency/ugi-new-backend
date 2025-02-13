import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import ServiceBooking from './serviceBooking.model';
import { TServiceBooking } from './serviceBooking.interface';
import { Payment } from '../payment/payment.model';
// import { cencelBookingController } from '../cencelBooking/cencelBooking.controller';
// import CencelBooking from '../cencelBooking/cencelBooking.model';
import moment from 'moment';
import httpStatus from 'http-status';
import { ugiTokenService } from '../ugiToken/ugiToken.service';
import Business from '../business/business.model';
import { notificationService } from '../notification/notification.service';
import { paymentService } from '../payment/payment.service';
import Notification from '../notification/notification.model';

const createServiceBooking = async (
  payload: TServiceBooking,
  session: mongoose.ClientSession,
) => {
  const { bookingDate, bookingStartTime, bookingEndTime, businessId } = payload;

  const isValidTimeFormat = (time: string) =>
    moment(time, 'hh:mm A', true).isValid();
  if (
    typeof bookingStartTime !== 'string' ||
    typeof bookingEndTime !== 'string' ||
    !isValidTimeFormat(bookingStartTime) ||
    !isValidTimeFormat(bookingEndTime)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid time format for start or end time , you send this formate hh:mm A',
    );
  }

  // console.log({ payload });

  const business = await Business.findOne({ businessId });
  // console.log({ business });

  if (!business) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Business not found');
  }

  // console.log('before existing booking');

  const existingBooking = await ServiceBooking.findOne({
    businessId,
    bookingDate,
    status: 'booking',
    $or: [
      {
        $and: [
          { bookingStartTime: { $gte: bookingStartTime } },
          { bookingStartTime: { $lte: bookingEndTime } },
        ],
      },

      {
        $and: [
          { bookingEndTime: { $gte: bookingStartTime } },
          { bookingEndTime: { $lte: bookingEndTime } },
        ],
      },
    ],
  }).session(session);
  // console.log('after existing booking');
  // console.log({ existingBooking });

  if (existingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Booking time is overlapping with an existing booking',
    );
  }

  // console.log("before service create");
  // console.log({ payload });
  const result = await ServiceBooking.create([payload], { session }); // Use session if provided


  return result;
};


const getAllServiceBookingByUserQuery = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  // console.log('booking user id', customerId);
  const ServiceBookingQuery = new QueryBuilder(
    ServiceBooking.find({ customerId })
      .populate('customerId')
      .populate({
        path: 'serviceId',
        populate: { path: 'businessUserId', select: 'fullName' },
      }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ServiceBookingQuery.modelQuery;
  const meta = await ServiceBookingQuery.countTotal();
  return { meta, result };
};

const getAllServiceBookingByBusinessQuery = async (
  query: Record<string, unknown>,
  businessId: string,
) => {
  const ServiceBookingQuery = new QueryBuilder(
    ServiceBooking.find({ businessId })
      .populate('customerId')
      .populate('serviceId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ServiceBookingQuery.modelQuery;
  const meta = await ServiceBookingQuery.countTotal();
  return { meta, result };
};

const getSingleServiceBooking = async (id: string) => {
  const result = await ServiceBooking.findById(id).populate('serviceId');
  return result;
};



const cancelServiceBooking = async (id: string, customerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const serviceBooking: any =
      await ServiceBooking.findById(id).session(session);
    // console.log({ serviceBooking });

    if (!serviceBooking) {
      throw new AppError(404, 'Booking Service not found!');
    }

    // Validate business existence
    const business = await Business.findOne({
      businessId: serviceBooking.businessId,
    }).session(session);
    if (!business) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Business not found');
    }

    // Prevent double cancellation
    if (serviceBooking.status === 'complete') {
      throw new AppError(404, 'Booking Service is already completed!');
    }
    if (serviceBooking.status === 'cencel') {
      throw new AppError(404, 'Booking Service is already canceled!');
    }

    // console.log('step-2');

    // Check if the user is authorized to cancel this booking
    if (serviceBooking.customerId.toString() !== customerId) {
      throw new AppError(
        403,
        'You are not authorized to cancel this ServiceBooking!',
      );
    }

    // console.log('step-3');

    // // Calculate the time difference in hours
    // const currentTime = new Date();
    // currentTime.setUTCHours(0, 0, 0, 0);
    // // console.log({ currentTime });
    // const bookingTime = serviceBooking.bookingDate;
    // // console.log({ bookingTime });
    // const timeDifferenceInHours =
    //   (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
    // // console.log({ timeDifferenceInHours });

    // // console.log('step-4');

    // let refundPercentage = 0;
    // let ugiTokenParcentage = 0;

    // // Apply refund policy
    // if (timeDifferenceInHours <= 24) {
    //   refundPercentage = 0; // No refund
    //   ugiTokenParcentage = 100;
    // } else if (timeDifferenceInHours <= 36) {
    //   refundPercentage = 20; // Refund 20% of the deposit
    //   ugiTokenParcentage = 80;
    // } else if (timeDifferenceInHours <= 48) {
    //   refundPercentage = 75; // Refund 75% of the deposit
    //   ugiTokenParcentage = 25;
    // }

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0); // Normalize current date to midnight

    const bookingTime = new Date(serviceBooking.bookingDate);
    bookingTime.setUTCHours(0, 0, 0, 0); // Normalize booking date to midnight

    // Calculate the difference in hours
    const timeDifferenceInHours =
      (bookingTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

    console.log({ timeDifferenceInHours });

    let refundPercentage = 0;
    let ugiTokenPercentage = 0;

    // Apply refund policy based on time remaining until booking
    if (timeDifferenceInHours >= 48) {
      refundPercentage = 75; // Refund 75% of the deposit
      ugiTokenPercentage = 25;
    } else if (timeDifferenceInHours >= 36) {
      refundPercentage = 20; // Refund 20% of the deposit
      ugiTokenPercentage = 80;
    } else if (timeDifferenceInHours >= 24) {
      refundPercentage = 0; // No refund
      ugiTokenPercentage = 100;
    } else {
      refundPercentage = 0; // No refund
      ugiTokenPercentage = 100;
    }
    // console.log('step-5');
    // console.log('refundPercentage', refundPercentage);
    // console.log('ugiTokenParcentage', ugiTokenParcentage);
// ugiTokenParcentage; ugiTokenParcentage; 
    // Calculate refund amount
    const refundAmount = Math.floor(
      (serviceBooking.depositAmount * refundPercentage) / 100,
    );
    // console.log({ refundAmount });

    // Convert remaining amount into Uogi Token
    const uogiTokenAmount = Math.floor(
      serviceBooking.depositAmount - refundAmount,
    );
    // console.log({ uogiTokenAmount });

    // Update booking status to 'cancel'
    serviceBooking.status = 'cencel';
    serviceBooking.cencelationParsentage = refundPercentage || 0;
    serviceBooking.cencelationAmount = refundAmount || 0;
    serviceBooking.cencelationHours = Math.floor(timeDifferenceInHours) || 0;

    serviceBooking.markModified('cencelationParsentage');
    serviceBooking.markModified('cencelationAmount');
    serviceBooking.markModified('cencelationHours');

    // console.log('Before Save:', serviceBooking.toObject());
    // await serviceBooking.save({ session });
    await serviceBooking.save({ session });
    // console.log('After Save:', result.toObject());

    // Fetch the payment data for the booking
    const paymentData = await Payment.findOne({
      serviceBookingId: serviceBooking._id,
      status: 'paid',
    }).session(session);

    if (!paymentData) {
      throw new AppError(404, 'Payment not found!');
    }

    // Handle Stripe refund
    if (paymentData.method === 'stripe' && refundAmount > 0) {
      const refundData: any = {
        amount: refundAmount,
        payment_intent: paymentData.transactionId,
      };

      const refundResult = await paymentService.paymentRefundService(
        refundData.amount,
        refundData.payment_intent,
      );

      if (refundResult.status !== 'succeeded') {
        throw new AppError(500, 'Refund not created');
      }
      paymentData.depositAmount =
        paymentData.depositAmount - Number(refundAmount);
      await paymentData.save({ session });

      serviceBooking.refundStatus = 'success';
      await serviceBooking.save({ session });
    } else {
      serviceBooking.refundStatus = 'pending';
      await serviceBooking.save({ session });
    }

    // Create Ugi Token data
    const ugiTokenData: any = {
      businessId: serviceBooking.businessId,
      ugiTokenParcentage: ugiTokenPercentage,
      ugiTokenAmount: uogiTokenAmount,
    };

    const tokenCreate = await ugiTokenService.createUgiTokenService(
      ugiTokenData,
      session,
    );

    if (!tokenCreate) {
      throw new AppError(500, 'Ugi token not created');
    }

    // Create Notifications
    const notificationData: any = {
      userId: business.businessId,
      message: `Booking Cancelled Successfully! Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
      type: 'success',
    };

    const notificationData1: any = {
      userId: business.businessId,
      message: `Create Ugi Token Request Successfully!`,
      type: 'ugiToken',
      isUgiToken: tokenCreate[0]._id,
    };

    const [notification, notification1] = await Promise.all([
      notificationService.createNotification(notificationData, session),
      notificationService.createNotification(notificationData1, session),
    ]);

    if (!notification || !notification1) {
      throw new AppError(500, 'Notification not created');
    }

    // Commit the transaction (All operations succeed)
    await session.commitTransaction();
    session.endSession();

    return {
      message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
      refundAmount: refundAmount ? refundAmount : 0,
      uogiTokenAmount: uogiTokenAmount ? uogiTokenAmount : 0,
    };
  } catch (error) {
    console.error('Transaction Error:', error);

    // Rollback changes if any error occurs
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const paymentStatusServiceBooking = async (id: string, customerId: string) => {
  const idCheck = mongoose.Types.ObjectId.isValid(id);
  if (!idCheck) {
    throw new AppError(400, 'Invalid Id');
  }

  const bookingService = await ServiceBooking.findById(id);

  if (!bookingService) {
    throw new AppError(404, 'Booking Service not found!');
  }

  if (bookingService.customerId.toString() !== customerId) {
    throw new AppError(
      403,
      'You are not authorized to complete this ServiceBooking!!',
    );
  }

  bookingService.paymentStatus = 'processing';
  const result = await bookingService.save();

  const notificationData: any = {
    userId: customerId,
    message: `Payment Done Successfully!`,
    type: 'success',
  };

  const notification =
    await notificationService.createNotification(notificationData);
  if (!notification) {
    throw new AppError(500, 'Notification not created');
  }

  return result;
};


const completeServiceBooking = async (id: string, customerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  // console.log('id*****+++',id)

  try {
    // 1️⃣ Find the Service Booking inside the transaction
    const bookingService = await ServiceBooking.findById(id).session(session);

    if (!bookingService) {
      throw new AppError(404, 'Booking Service not found!');
    }

    if (bookingService.customerId.toString() !== customerId) {
      throw new AppError(
        403,
        'You are not authorized to complete this ServiceBooking!!',
      );
    }

    // 2️⃣ Update the service booking status
    bookingService.status = 'complete';
    bookingService.paymentStatus = 'paid';
    const result = await bookingService.save({ session });

    // 3️⃣ Create notifications inside the transaction
    const notificationData = {
      userId: customerId,
      message: `Complete Service Booking Successfully!`,
      type: 'success',
    };
    const notificationData1 = {
      role: 'admin',
      message: `Complete Service Booking Successfully!`,
      type: 'success',
    };

    const [notification, notification1] = await Promise.all([
      notificationService.createNotification(notificationData, session),
      notificationService.createNotification(notificationData1, session),
    ]);

    if (!notification || !notification1) {
      throw new AppError(500, 'Notification not created');
    }

    // 4️⃣ Commit the transaction (All operations succeed)
    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    console.error('Transaction Error:', error);

    // 5️⃣ Abort transaction if an error occurs
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const reSheduleRequestServiceBooking = async (id: string, payload: any) => {
  const bookingService: any = await ServiceBooking.findById(id);

  if (!bookingService) {
    throw new AppError(404, 'Booking Service not found!');
  }

  if (bookingService.customerId.toString() !== payload.customerId) {
    throw new AppError(
      403,
      'You are not authorized to complete this ServiceBooking!!',
    );
  }

  if (
    bookingService.status === 'complete' ||
    bookingService.status === 'cencel'
  ) {
    throw new AppError(
      403,
      'This ServiceBooking is not available for re-shedule service is complete!!',
    );
  }

  if (bookingService.reSheduleStatus !== 'no-shuedule') {
    throw new AppError(
      403,
      'You are not authorized to re-shedule this ServiceBooking!!',
    );
  }

  if (bookingService.reSheduleStatus === 'pending-re-shedule') {
    throw new AppError(403, 'Already pending re-shedule request!');
  }

  const startTime = moment(payload.bookingStartTime, 'hh:mm A');
  const endTime = startTime.clone().add(bookingService.duration - 1, 'minutes');
  payload.bookingStartTime = startTime.format('hh:mm A');
  payload.bookingEndTime = endTime.format('hh:mm A');

  const isValidTimeFormat = (time: string) =>
    moment(time, 'hh:mm A', true).isValid();
  if (
    typeof payload.bookingStartTime !== 'string' ||
    typeof payload.bookingEndTime !== 'string' ||
    !isValidTimeFormat(payload.bookingStartTime) ||
    !isValidTimeFormat(payload.bookingEndTime)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid time format for start or end time , you send this formate hh:mm A',
    );
  }

  const business = await Business.findOne({
    businessId: bookingService.businessId,
  });
  // console.log({ business });

  if (!business) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Business not found');
  }

  // console.log(payload.bookingDate);
  // console.log(payload.bookingStartTime);
  // console.log(payload.bookingEndTime);

  const existingBooking = await ServiceBooking.findOne(
    {
      businessId: bookingService.businessId,
      bookingDate: payload.bookingDate,
      status: 'booking',
      $or: [
        {
          $and: [
            { bookingStartTime: { $gte: payload.bookingStartTime } },
            { bookingStartTime: { $lte: payload.bookingEndTime } },
          ],
        },

        {
          $and: [
            { bookingEndTime: { $gte: payload.bookingStartTime } },
            { bookingEndTime: { $lte: payload.bookingEndTime } },
          ],
        },
      ],
    },
    // { session },
  );

  // console.log({ existingBooking });

  if (existingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Booking time is overlapping with an existing booking',
    );
  }

  bookingService.reSheduleStartTime = payload.bookingStartTime;
  bookingService.reSheduleEndTime = payload.bookingEndTime;
  bookingService.reSheduleDate = payload.bookingDate;

  bookingService.reSheduleStatus = 'pending-re-shedule';
  const result = await bookingService.save();

  const notificationData = {
    userId: bookingService.businessId,
    message: `Re-shedule Request Service Booking Successfully!`,
    status: 'pending',
    type: 'reshedule',
    serviceBookingId: bookingService._id,
  };

  const notification =
    await notificationService.createNotification(notificationData);

  if (!notification) {
    throw new AppError(500, 'Notification not created');
  }

  return result;
};

const reSheduleCompleteCencelServiceBooking = async (
  id: string,
  businessId: string,
  status: string,
) => {
  const bookingService: any = await ServiceBooking.findById(id);

  if (!bookingService) {
    throw new AppError(404, 'Booking Service not found!');
  }

  const notification = await Notification.findOne({
    serviceBookingId: bookingService._id,
  });

  if (!notification) {
    throw new AppError(404, 'Notification not found!');
  }

  if (bookingService.businessId.toString() !== businessId) {
    throw new AppError(403, 'You are not authorized to this ServiceBooking!!');
  }

  if (
    bookingService.reSheduleStatus !== 'pending-re-shedule' &&
    bookingService.reSheduleStatus !== 'cencel-re-shedule' &&
    bookingService.reSheduleStatus !== 'conform-re-shedule'
  ) {
    throw new AppError(
      403,
      'You are not authorized to re-shedule this ServiceBooking!!',
    );
  }

  if (status == 'cencel') {
    bookingService.reSheduleStatus = 'cencel-re-shedule';

    const result = await bookingService.save();

    if (notification && notification._id) {
      await Notification.findByIdAndUpdate(
        notification._id,
        { status: 'cancel' },
        { new: true },
      );
      // console.log('Notification updated: cancel');
    }

    return result;
  } else if (status == 'conform') {
    bookingService.reSheduleStatus = 'conform-re-shedule';
    // console.log('date date', bookingService.reSheduleDate);
    if (bookingService.reSheduleDate) {
      // console.log('ture', bookingService.reSheduleDate);
      bookingService.bookingDate = new Date(bookingService.reSheduleDate);
    }

    // console.log('new =========',new Date(bookingService.reSheduleDate));
    // console.log('new date', bookingService.bookingDate);

    bookingService.bookingStartTime = bookingService.reSheduleStartTime;
    bookingService.bookingEndTime = bookingService.reSheduleEndTime;
    bookingService.reSheduleDate = ' ';
    bookingService.reSheduleStartTime = ' ';
    bookingService.reSheduleEndTime = ' ';
    const result = await bookingService.save();

    if (notification && notification._id) {
      await Notification.findByIdAndUpdate(
        notification._id,
        { status: 'accept' },
        { new: true },
      );
      // console.log('Notification updated: accept');
    }

    return result;
  } else {
    throw new AppError(403, 'You are not authorized to this ServiceBooking!!');
  }
};

export const serviceBookingService = {
  createServiceBooking,
  getAllServiceBookingByUserQuery,
  getAllServiceBookingByBusinessQuery,
  paymentStatusServiceBooking,
  cancelServiceBooking,
  getSingleServiceBooking,
  completeServiceBooking,
  reSheduleRequestServiceBooking,
  reSheduleCompleteCencelServiceBooking,
};
