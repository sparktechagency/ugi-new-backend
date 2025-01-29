import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import ServiceBooking from './serviceBooking.model';
import { TServiceBooking } from './serviceBooking.interface';
import { Payment } from '../payment/payment.model';
import { cencelBookingController } from '../cencelBooking/cencelBooking.controller';
import CencelBooking from '../cencelBooking/cencelBooking.model';
import moment from 'moment';
import httpStatus from 'http-status';
import { ugiTokenService } from '../ugiToken/ugiToken.service';
import Business from '../business/business.model';
import { notificationService } from '../notification/notification.service';
import { paymentService } from '../payment/payment.service';


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

  console.log({ payload });

  const business = await Business.findOne({businessId});
  console.log({ business });

  if(!business){
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Business not found',
    );
  }

console.log('before existing booking');

 const existingBooking = await ServiceBooking.findOne(
   {

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
   }
 ).session(session);
   console.log('after existing booking');
 console.log({ existingBooking });


  if (existingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Booking time is overlapping with an existing booking',
    );
  }

console.log("before service create");
 console.log({ payload });
  const result = await ServiceBooking.create([payload], { session }); // Use session if provided
  // const result = await ServiceBooking.create(payload); // Use session if provided
  console.log('after service create');
  
  
  return result;
};

const getAllServiceBookingByUserQuery = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const ServiceBookingQuery = new QueryBuilder(
    ServiceBooking.find({ customerId,  })
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



// const cancelServiceBooking = async (id: string, customerId: string) => {
//   console.log('customerid', customerId)
//   // Fetch the user by ID
//   // const user = await User.findById(userId);
//   // if (!user) {
//   //   throw new AppError(404, 'User not found!');
//   // }

//   // Fetch the service booking by ID
//   const serviceBooking: any = await ServiceBooking.findById(id);
//   console.log({ serviceBooking });
//   if (!serviceBooking) {
//     throw new AppError(404, 'Booking Service not found!');
//   }
//   const business = await Business.findOne({businessId: serviceBooking.businessId});
//   if(!business){
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Business not found',
//     );
//   }

//   if (serviceBooking.status === 'complete') {
//     throw new AppError(404, 'Booking Service is already completed!');
//   }
//   if (serviceBooking.status === 'cencel') {
//     throw new AppError(404, 'Booking Service is already Cenceled!');
//   }
//    console.log('step-2');

//   // Check if the user is authorized to cancel this booking
//   if (serviceBooking.customerId.toString() !== customerId) {
//     throw new AppError(
//       403,
//       'You are not authorized to cancel this ServiceBooking!!',
//     );
//   }
//  console.log('step-3');
//   // Calculate the time difference in hours
//   const currentTime = new Date();
//   console.log({ currentTime });
//   const bookingTime = serviceBooking.bookingDate;
//   console.log({ bookingTime });
//   const timeDifferenceInHours =
//     (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
//   console.log({ timeDifferenceInHours });

//    console.log('step-4');
//   let refundPercentage = 0;
//   let ugiTokenParcentage = 0;

//   // Apply refund policy
//   if (timeDifferenceInHours <= 24) {
//     refundPercentage = 0; // No refund
//     ugiTokenParcentage = 100;
//   } else if (timeDifferenceInHours <= 36) {
//     refundPercentage = 20; // Refund 20% of the deposit
//     ugiTokenParcentage = 80;
//   } else if (timeDifferenceInHours <= 48) {
//     refundPercentage = 75; // Refund 75% of the deposit
//     ugiTokenParcentage = 25;
//   }
//   console.log('step-5');

//   // Calculate refund amount
//   const refundAmount = (serviceBooking.depositAmount * refundPercentage) / 100;
//   console.log({ refundAmount });

//   // Convert remaining amount into Uogi Token
//   const uogiTokenAmount = serviceBooking.depositAmount - refundAmount;
//  console.log({ uogiTokenAmount });
//   // Update booking status to 'cancel'

//   serviceBooking.status = 'cencel';
//   serviceBooking.cencelationParsentage = refundPercentage;
//   serviceBooking.cencelationAmount = refundAmount;
//   serviceBooking.cencelationHours = Math.floor(timeDifferenceInHours);
//   // await serviceBooking.save();
//   // console.log({ serviceBooking });
//   console.log('Before Save:', serviceBooking);
//   await serviceBooking.save();
//   console.log('After Save:', serviceBooking);

//   const paymentData = await Payment.findOne({
//     serviceBookingId: serviceBooking._id,
//     status:'paid',
//   });

//   if (!paymentData) {
//     throw new AppError(404, 'Payment not found!');
//   }

//   if(paymentData.method === 'stripe'){

//     const refundData:any = {
//       amount: refundAmount,
//       payment_intent: paymentData.transactionId,
//     };

//     const refundResult = await paymentService.paymentRefundService(refundData.amount, refundData.payment_intent);

//     if(refundResult.status !== 'succeeded'){
//       throw new AppError(500, 'Refund not created');
//     }

//     serviceBooking.refundStatus = 'success';
//     await serviceBooking.save();

//   }


//    serviceBooking.refundStatus = 'pending';
//    await serviceBooking.save();



  


//   const ugiTokenData: any = {
//     businessId: serviceBooking.businessId,
//     ugiTokenParcentage: ugiTokenParcentage,
//     ugiTokenAmount: uogiTokenAmount,
//   };

//   const tokenCreate = await ugiTokenService.createUgiTokenService(ugiTokenData);

//   if (!tokenCreate) {
//     throw new AppError(500, 'Ugi token not created');
//   }

//   const notificationData: any = {
//     userId: business.businessId,
//     message: `Booking Cancelled Successfully! Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
//     type: 'success',
//   };
//   const notificationData1: any = {
//     userId: business.businessId,
//     message: `Create Ugi Token Request Successfully!`,
//     type: 'success',
//     isUgiToken: tokenCreate._id,
//   };
//   const notification =
//     await notificationService.createNotification(notificationData);
//   const notification1 =
//     await notificationService.createNotification(notificationData1);
//     if(!notification || !notification1){
//       throw new AppError(500, 'Notification not created');
//     }

//   return {
//     message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
//     refundAmount: refundAmount ? refundAmount : 0,
//     uogiTokenAmount: uogiTokenAmount ? uogiTokenAmount : 0,
//   };
// };



const cancelServiceBooking = async (id: string, customerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('customerid', customerId);

    // Fetch the service booking by ID inside the transaction
    const serviceBooking: any =
      await ServiceBooking.findById(id).session(session);
    console.log({ serviceBooking });

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
    if (serviceBooking.status === 'cancel') {
      throw new AppError(404, 'Booking Service is already canceled!');
    }

    console.log('step-2');

    // Check if the user is authorized to cancel this booking
    if (serviceBooking.customerId.toString() !== customerId) {
      throw new AppError(
        403,
        'You are not authorized to cancel this ServiceBooking!',
      );
    }

    console.log('step-3');

    // Calculate the time difference in hours
    const currentTime = new Date();
    console.log({ currentTime });
    const bookingTime = serviceBooking.bookingDate;
    console.log({ bookingTime });
    const timeDifferenceInHours =
      (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
    console.log({ timeDifferenceInHours });

    console.log('step-4');

    let refundPercentage = 0;
    let ugiTokenParcentage = 0;

    // Apply refund policy
    if (timeDifferenceInHours <= 24) {
      refundPercentage = 0; // No refund
      ugiTokenParcentage = 100;
    } else if (timeDifferenceInHours <= 36) {
      refundPercentage = 20; // Refund 20% of the deposit
      ugiTokenParcentage = 80;
    } else if (timeDifferenceInHours <= 48) {
      refundPercentage = 75; // Refund 75% of the deposit
      ugiTokenParcentage = 25;
    }
    console.log('step-5');

    // Calculate refund amount
    const refundAmount =
      (serviceBooking.depositAmount * refundPercentage) / 100;
    console.log({ refundAmount });

    // Convert remaining amount into Uogi Token
    const uogiTokenAmount = serviceBooking.depositAmount - refundAmount;
    console.log({ uogiTokenAmount });

    // Update booking status to 'cancel'
    serviceBooking.status = 'cancel';
    serviceBooking.cancelationPercentage = refundPercentage;
    serviceBooking.cancelationAmount = refundAmount;
    serviceBooking.cancelationHours = Math.floor(timeDifferenceInHours);

    console.log('Before Save:', serviceBooking);
    await serviceBooking.save({ session });
    console.log('After Save:', serviceBooking);

    // Fetch the payment data for the booking
    const paymentData = await Payment.findOne({
      serviceBookingId: serviceBooking._id,
      status: 'paid',
    }).session(session);

    if (!paymentData) {
      throw new AppError(404, 'Payment not found!');
    }

    // Handle Stripe refund
    if (paymentData.method === 'stripe') {
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

      serviceBooking.refundStatus = 'success';
      await serviceBooking.save({ session });
    } else {
      serviceBooking.refundStatus = 'pending';
      await serviceBooking.save({ session });
    }

    // Create Ugi Token data
    const ugiTokenData: any = {
      businessId: serviceBooking.businessId,
      ugiTokenParcentage: ugiTokenParcentage,
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
      type: 'success',
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

  const notificationData:any = {
    userId: customerId,
    message: `Payment Done Successfully!`,
    type: 'success',
  };
  
  const notification =
    await notificationService.createNotification(notificationData);
    if(!notification){
      throw new AppError(500, 'Notification not created');
    }


  return result;
};



// const completeServiceBooking = async (id: string, customerId: string) => {
//   const bookingService = await ServiceBooking.findById(id);

//   if (!bookingService) {
//     throw new AppError(404, 'Booking Service not found!');
//   }

//   if (bookingService.customerId.toString() !== customerId) {
//     throw new AppError(
//       403,
//       'You are not authorized to complete this ServiceBooking!!',
//     );
//   }
 

//   bookingService.status = 'complete';
//   bookingService.paymentStatus = 'paid';
//   const result = await bookingService.save();
//    const notificationData: any = {
//      userId: customerId,
//      message: `Complete Service Booking Successfully!`,
//      type: 'success',
//    };
//    const notificationData1: any = {
//      role: 'admin',
//      message: `Complete Service Booking Successfully!`,
//      type: 'success',
//    };
//    const notification =
//      await notificationService.createNotification(notificationData);
//    const notification1 =
//      await notificationService.createNotification(notificationData1);
//    if (!notification || !notification1) {
//      throw new AppError(500, 'Notification not created');
//    }
//   return result;
// };



const completeServiceBooking = async (id: string, customerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log('id*****+++',id)

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


const reSheduleRequestServiceBooking = async (
  id: string,
  payload: any,
) => {
  const bookingService = await ServiceBooking.findById(id);

  if (!bookingService) {
    throw new AppError(404, 'Booking Service not found!');
  }

  if (bookingService.customerId.toString() !== payload.customerId) {
    throw new AppError(
      403,
      'You are not authorized to complete this ServiceBooking!!',
    );
  }


  if (bookingService.status === 'complete' || bookingService.status === 'cencel') {
    throw new AppError(
      403,
      'This ServiceBooking is not available for re-shedule!!',
    );
  }


  if (bookingService.reSheduleStatus !== 'no-shuedule') {
    throw new AppError(
      403,
      'You are not authorized to re-shedule this ServiceBooking!!',
    );
  }

   const startTime = moment(payload.bookingStartTime, 'hh:mm A');
   const endTime = startTime
     .clone()
     .add(bookingService.duration - 1, 'minutes');
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

  const business = await Business.findOne({ businessId:bookingService.businessId });
  console.log({ business });

  if (!business) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Business not found');
  }

  console.log(payload.bookingDate);
  console.log(payload.bookingStartTime);
  console.log(payload.bookingEndTime);

  const existingBooking = await ServiceBooking.findOne(
    {
      businessId: bookingService.businessId,
      bookingDate: payload.bookingDate,
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

  console.log({ existingBooking });

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
  return result;
};

const reSheduleCompleteCencelServiceBooking = async (
  id: string,
  businessId: string,
  status:string,
) => {
  const bookingService = await ServiceBooking.findById(id);

  if (!bookingService) {
    throw new AppError(404, 'Booking Service not found!');
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
  


  if (status == "cencel") {
    bookingService.reSheduleStatus = 'cencel-re-shedule';
    const result = await bookingService.save();
    return result;
  }else if (status == "conform") {
    bookingService.reSheduleStatus = 'conform-re-shedule';
    const result = await bookingService.save();
    return result;
  }else{
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
