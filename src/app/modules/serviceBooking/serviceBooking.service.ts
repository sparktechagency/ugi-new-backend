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


const createServiceBooking = async (
  payload: TServiceBooking,
  // session?: mongoose.ClientSession,
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

  const existingBooking = await ServiceBooking.findOne(
    {
      businessId,
      bookingDate,
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
    },
    // { session },
  );

  if (existingBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Booking time is overlapping with an existing booking',
    );
  }


  // const result = await ServiceBooking.create([payload], { session }); // Use session if provided
  const result = await ServiceBooking.create(payload); // Use session if provided
  return result;
};

const getAllServiceBookingByUserQuery = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const ServiceBookingQuery = new QueryBuilder(
    ServiceBooking.find({ customerId }),
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
  const result = await ServiceBooking.findById(id);
  return result;
};



const cancelServiceBooking = async (id: string, customerId: string) => {
  console.log('customerid', customerId)
  // Fetch the user by ID
  // const user = await User.findById(userId);
  // if (!user) {
  //   throw new AppError(404, 'User not found!');
  // }

  // Fetch the service booking by ID
  const serviceBooking: any = await ServiceBooking.findById(id);
  console.log({ serviceBooking });
  if (!serviceBooking) {
    throw new AppError(404, 'Booking Service not found!');
  }
  if (serviceBooking.status === 'complete') {
    throw new AppError(404, 'Booking Service is already completed!');
  }
  if (serviceBooking.status === 'cencel') {
    throw new AppError(404, 'Booking Service is already Cenceled!');
  }

  // Check if the user is authorized to cancel this booking
  if (serviceBooking.customerId.toString() !== customerId) {
    throw new AppError(
      403,
      'You are not authorized to cancel this ServiceBooking!!',
    );
  }

  // Calculate the time difference in hours
  const currentTime = new Date();
  console.log({ currentTime });
  const bookingTime = serviceBooking.bookingDate;
  console.log({ bookingTime });
  const timeDifferenceInHours =
    (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
  console.log({ timeDifferenceInHours });

  let refundPercentage = 0;

  // Apply refund policy
  if (timeDifferenceInHours <= 24) {
    refundPercentage = 0; // No refund
  } else if (timeDifferenceInHours <= 36) {
    refundPercentage = 20; // Refund 20% of the deposit
  } else if (timeDifferenceInHours <= 48) {
    refundPercentage = 75; // Refund 75% of the deposit
  }

  // Calculate refund amount
  const refundAmount = (serviceBooking.depositAmount * refundPercentage) / 100;

  // Convert remaining amount into Uogi Token
  const uogiTokenAmount = serviceBooking.depositAmount - refundAmount;

  // Update booking status to 'cancel'
  serviceBooking.status = 'cencel';
  await serviceBooking.save();

  const ugiTokenData: any = {
    customerId: serviceBooking.customerId,
    businessId: serviceBooking.businessId,
    serviceId: serviceBooking.serviceId,
    serviceBookingId: serviceBooking._id,
    cencelationParsentage: refundPercentage,
    cencelationAmount: refundAmount ? refundAmount : 0,
    cencelationHours: Math.floor(timeDifferenceInHours),
  };
  console.log({ ugiTokenData });

  const tokenCreate = await ugiTokenService.createUgiTokenService(ugiTokenData);

  if (!tokenCreate) {
    throw new AppError(500, 'Ugi token not created');
  }

  return {
    message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
    refundAmount: refundAmount ? refundAmount : 0,
    uogiTokenAmount: uogiTokenAmount ? uogiTokenAmount : 0,
  };
};


const completeServiceBooking = async (id: string, customerId: string) => {
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

  bookingService.status = 'complete';
  const result = await bookingService.save();
  return result;
};


export const serviceBookingService = {
  createServiceBooking,
  getAllServiceBookingByUserQuery,
  cancelServiceBooking,
  getSingleServiceBooking,
  completeServiceBooking,
};
