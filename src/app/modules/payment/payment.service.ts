
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { TPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import QueryBuilder from '../../builder/QueryBuilder';
import ServiceBooking from "../serviceBooking/serviceBooking.model";

const addPaymentService = async (payload:TPayment) => {
      const {
        userId,
        serviceId,
        buisnessId,
        amount,
        method,
        bankDetails,
        paypalPayDetails,
        applePayDetails,
      } = payload;
    
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, 'User is not found!');
  }

  if (user.role !== 'user') {
    throw new AppError(400, 'User is not authorized as a User!!');
  }
 
  const buisness = await ServiceBooking.findById(buisnessId);
  if (!buisness) {
    throw new AppError(400, 'Buisness is not found!');
  }

  const service = await ServiceBooking.findById(serviceId);
  if (!service) {
    throw new AppError(400, 'Service is not found!');
  }


//   if (!task.provider.equals(providerId)) {
//     return next(new AppError(400, 'Task Provider is not found!'));
//   }
  // Validate Paymental Amount
  if (!amount || amount <= 0) {
    throw new AppError(
      400,
      'Invalid Paymental amount. It must be a positive number.',
    );
  }

  // Validate Paymental Method
  const validMethods = ['bank', 'paypal_pay', 'apple_pay'];
  if (!method || !validMethods.includes(method)) {
     throw new AppError(400, 'Invalid Paymental method.');
  }

  // Method-specific validation
  if (method === 'bank') {
    if (
      !bankDetails ||
      !bankDetails.accountNumber ||
      !bankDetails.accountName ||
      !bankDetails.bankName
    ) {
       throw new AppError(
         400,
         'All bank details (account number, account name, bank name) are required for bank Paymentals.',
       );
    }
  } else if (method === 'paypal_pay') {
    if (!paypalPayDetails || !paypalPayDetails.paypalId) {
      throw new AppError(
        400,
        'Google Pay token is required for Google Pay Paymentals.',
      );
    }
  } else if (method === 'apple_pay') {
    if (!applePayDetails || !applePayDetails.appleId) {
       throw new AppError(
         400,
         'Apple Pay token is required for Apple Pay Paymentals.',
       );
    }
  }

    const result = await Payment.create(payload);
    const bookingData = {
      buisnessId: buisnessId,
      serviceId: serviceId,
      amount: amount,
      method: method,
      status: 'booking',
      userId: user._id,   
    }

   await ServiceBooking.create(bookingData);
    return result;


};

const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find()
      .populate('mentorId')
      .populate('menteeId')
      .populate('sheduleBookingId'),
    query,
  )
    .search(['name'])
    .filter()             
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};
const getAllPaymentByMentorService = async (
    query: Record<string, unknown>,
  mentorId:string,
) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ mentorId }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};

const singlePaymentService = async (id: string) => {
  const task = await Payment.findById(id);
  return task;
};

const deleteSinglePaymentService = async (id: string) => {
  const result = await Payment.deleteOne({ _id: id });
  return result;
};

export const paymentService = {
  addPaymentService,
  getAllPaymentService,
  singlePaymentService,
  deleteSinglePaymentService,
  getAllPaymentByMentorService,
};
