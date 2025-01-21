
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { TPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import QueryBuilder from '../../builder/QueryBuilder';
import ServiceBooking from "../serviceBooking/serviceBooking.model";
import Business from "../business/business.model";
import Service from "../service/service.model";
import moment from "moment";
import { serviceBookingService } from "../serviceBooking/serviceBooking.service";
import httpStatus from "http-status";
import mongoose from "mongoose";


const addPaymentService = async (payload: any) => {
  // const session = await mongoose.startSession(); // Start a session
  // session.startTransaction();

  console.log('payment data', payload);

  // try {
    console.log('console.log-1');
    const {
      customerId,
      serviceId,
      businessId,
      bookingprice,
      depositAmount,
      dipositParsentage,
      bookingDate,
      duration,
      bookingStartTime,
      method,
      googlePayDetails,
      applePayDetails,
      transactionId,
    } = payload;

    console.log('console.log-2');
    const user = await User.findById(customerId);
    if (!user) {
      throw new AppError(400, 'User is not found!');
    }

    if (user.role !== 'customer') {
      throw new AppError(400, 'User is not authorized as a User!!');
    }

    const buisness = await Business.findById(businessId);
    if (!buisness) {
      throw new AppError(400, 'Business is not found!');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError(400, 'Service is not found!');
    }

    if (!depositAmount || depositAmount <= 0) {
      throw new AppError(
        400,
        'Invalid deposit amount. It must be a positive number.',
      );
    }
    console.log('console.log-3');
    if (!bookingprice || bookingprice <= 0) {
      throw new AppError(
        400,
        'Invalid booking amount. It must be a positive number.',
      );
    }

    if (!dipositParsentage || dipositParsentage <= 0) {
      throw new AppError(
        400,
        'Invalid deposit percentage. It must be a positive number.',
      );
    }

    const validMethods = ['google_pay', 'apple_pay'];
    if (!method || !validMethods.includes(method)) {
      throw new AppError(400, 'Invalid payment method.');
    }

    if (method === 'google_pay') {
      if (!googlePayDetails || !googlePayDetails.googleId) {
        throw new AppError(400, 'Google Pay token is required!');
      }
    } else if (method === 'apple_pay') {
      if (!applePayDetails || !applePayDetails.appleId) {
        throw new AppError(400, 'Apple Pay token is required!');
      }
    }

    const paymentData: any = {
      customerId,
      serviceId,
      businessId,
      bookingprice,
      depositAmount,
      dipositParsentage,
      method,
      transactionId,
      transactionDate: bookingDate,
    };

    if (method === 'google_pay') {
      paymentData.googlePayDetails = googlePayDetails;
    } else if (method === 'apple_pay') {
      paymentData.applePayDetails = applePayDetails;
    }
    console.log('console.log-4');
    console.log({ paymentData });

    const paymentResult = await Payment.create(paymentData);
    if (!paymentResult) {
      throw new AppError(400, 'Payment is not created!');
    }

    const startTimeOld = moment(bookingStartTime, 'hh:mm A');
    const endTimeOld = startTimeOld.clone().add(duration - 1, 'minutes');
    const startTime = startTimeOld.format('hh:mm A');
    const endTime = endTimeOld.format('hh:mm A');

    const bookingData: any = {
      customerId,
      serviceId,
      businessId,
      bookingprice,
      depositAmount,
      dipositParsentage,
      status: 'booking',
      bookingDate,
      duration,
      bookingStartTime: startTime,
      bookingEndTime: endTime,
    };
    console.log({ bookingData });

    const serviceBookingResult =
      await serviceBookingService.createServiceBooking(bookingData);
    if (!serviceBookingResult) {
      throw new AppError(400, 'Failed to create service booking!');
    }

    // Commit transaction
    // await session.commitTransaction();
    // session.endSession();
console.log('last console')
    return paymentResult;
  // } catch (error) {
  //   console.error('Transaction Error:', error);
  //   await session.abortTransaction(); 
  //   session.endSession();
  //   throw error; 
  // }
};


const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find(),
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
const getAllPaymentByCustomerService = async (
    query: Record<string, unknown>,
  customerId:string,
) => {
  const PaymentQuery = new QueryBuilder(Payment.find({ customerId }), query)
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

const getAllIncomeRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1); 
  const endOfYear = new Date(year + 1, 0, 1); 

  
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0, 
  }));

  console.log({ months });

  
  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$transactionDate' } },
        totalIncome: { $sum: '$depositAmount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  
  incomeData.forEach((data) => {
    const monthData = months.find((m) => m.month === data.month);
    if (monthData) {
      monthData.totalIncome = data.totalIncome; 
    }
  });

  console.log({ months });
  
  return months;
};



const getAllIncomeRatiobyDays = async (days: string) => {
  const currentDay = new Date();
  let startDate: Date;

  
  if (days === '7day') {
    startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000); 
  } else if (days === '24hour') {
    startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000); 
  } else {
    throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
  }

  console.log(`Fetching income data from ${startDate} to ${currentDay}`);

  
  const timeSlots =
    days === '7day'
      ? Array.from({ length: 7 }, (_, i) => {
          const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
          return {
            date: day.toISOString().split('T')[0], 
            totalIncome: 0,
          };
        }).reverse()
      : Array.from({ length: 24 }, (_, i) => {
          const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
          return {
            hour: hour.toISOString(), 
            totalIncome: 0,
          };
        }).reverse();

  
  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startDate, $lte: currentDay }, 
      },
    },
    {
      $group: {
        _id:
          days === '7day'
            ? {
                date: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$transactionDate',
                  },
                },
              }
            : {
                hour: {
                  $dateToString: {
                    format: '%Y-%m-%dT%H:00:00',
                    date: '$transactionDate',
                  },
                },
              }, 
        totalIncome: { $sum: '$depositAmount' }, 
      },
    },
    {
      $project: {
        date: days === '7day' ? '$_id.date' : null,
        hour: days === '24hour' ? '$_id.hour' : null,
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { [days === '7day' ? 'date' : 'hour']: 1 }, 
    },
  ]);

  
  incomeData.forEach((data) => {
    if (days === '7day') {
      const dayData = timeSlots.find((d:any) => d.date === data.date);
      if (dayData) {
        dayData.totalIncome = data.totalIncome;
      }
    } else if (days === '24hour') {
      const hourData = timeSlots.find((h:any) => h.hour === data.hour);
      if (hourData) {
        hourData.totalIncome = data.totalIncome;
      }
    }
  });

  

  return timeSlots;
};



export const paymentService = {
  addPaymentService,
  getAllPaymentService,
  singlePaymentService,
  deleteSinglePaymentService,
  getAllPaymentByCustomerService,
  getAllIncomeRatio,
  getAllIncomeRatiobyDays,
};
