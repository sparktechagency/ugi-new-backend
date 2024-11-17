
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { TPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import QueryBuilder from '../../builder/QueryBuilder';

const addPaymentService = async (payload:TPayment) => {
      const {
        mentorId,
        menteeId,
        sheduleBookingId,
        amount,
        method,
        bankDetails,
        paypalPayDetails,
        applePayDetails,
      } = payload;
    
  const mentor = await User.findById(mentorId);
  if (!mentor) {
    throw new AppError(400, 'Mentor is not found!');
  }

  if (mentor.role !== 'mentor') {
     throw new AppError(400, 'User is not authorized as a Mentor!!');
  }
  //   const task = await Task.findById(sheduleBookingId);
  //   if (!task) {
  //     return next(new AppError(400, 'Task is not found!'));
  //   }
  const mentee = await User.findById(menteeId);
  if (!mentee) {
    throw new AppError(400, 'Mentee is not found!');
  }
  if (mentee.role !== 'mentee') {
     throw new AppError(400, 'User is not authorized as a Mentee');
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
