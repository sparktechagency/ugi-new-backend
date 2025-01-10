import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import ServiceBooking from './serviceBooking.model';
import { TServiceBooking } from './serviceBooking.interface';
import { Payment } from '../payment/payment.model';
import { cencelBookingController } from '../cencelBooking/cencelBooking.controller';
import CencelBooking from '../cencelBooking/cencelBooking.model';


const createServiceBooking = async (payload: TServiceBooking) => {
  
  const result = await ServiceBooking.create(payload);
  return result;
};

const getAllServiceBookingByUserQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const ServiceBookingQuery = new QueryBuilder(
    ServiceBooking.find({ userId }),
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



const cancelServiceBooking = async (id: string, userId: string) => {
  // Fetch the user by ID
  // const user = await User.findById(userId);
  // if (!user) {
  //   throw new AppError(404, 'User not found!');
  // }

  // Fetch the service booking by ID
  const serviceBooking: any = await ServiceBooking.findById(id);
  if (!serviceBooking) {
    throw new AppError(404, 'Booking Service not found!');
  }

  // Check if the user is authorized to cancel this booking
  if (serviceBooking.userId.toString() !== userId) {
    throw new AppError(
      403,
      'You are not authorized to cancel this ServiceBooking!',
    );
  }

  // Calculate the time difference in hours
  const currentTime = new Date();
  console.log({ currentTime });
  const bookingTime = serviceBooking.createdAt;
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
  const refundAmount = (serviceBooking.amount * refundPercentage) / 100;

  // Convert remaining amount into Uogi Token
  const uogiTokenAmount = serviceBooking.amount - refundAmount;

  // Update booking status to 'cancel'
  serviceBooking.status = 'cancel';
  await serviceBooking.save();




  return {
    message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
    refundAmount,
    uogiTokenAmount,
  };
};



export const serviceBookingService = {
  createServiceBooking,
  getAllServiceBookingByUserQuery,
  cancelServiceBooking,
  getSingleServiceBooking,
};
