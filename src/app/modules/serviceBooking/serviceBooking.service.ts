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
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  // Fetch the service booking by ID
  const serviceBooking:any = await ServiceBooking.findById(id);
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
  const bookingCreatedTime = serviceBooking.createdAt;
  const timeDifferenceInHours =
    (currentTime.getTime() - bookingCreatedTime.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let refundAmount = 0;

  if (timeDifferenceInHours <= 12) {
    refundPercentage = 0;
  } else if (timeDifferenceInHours <= 24) {
    refundPercentage = 25;
  } else if (timeDifferenceInHours <= 48) {
    refundPercentage = 75;
  } 

  // Calculate refund amount
  refundAmount = (serviceBooking.amount * refundPercentage) / 100;

  // Update booking status to 'cancel'
  serviceBooking.status = 'cancel';
  await serviceBooking.save();
  const cancelBookingData ={
    userId: user._id,
  serviceId: serviceBooking._id,
  status: 'pending',
  amount: refundAmount
  }

  await CencelBooking.create(cancelBookingData);

  // Return the refund amount and a meaningful message
  return {
    message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the amount.`,
    refundAmount,
  };
};


export const serviceBookingService = {
  createServiceBooking,
  getAllServiceBookingByUserQuery,
  cancelServiceBooking,
  getSingleServiceBooking,
};
