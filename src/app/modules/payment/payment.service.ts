import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { TPayment } from './payment.interface';
import { Payment } from './payment.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ServiceBooking from '../serviceBooking/serviceBooking.model';
import Business from '../business/business.model';
import Service from '../service/service.model';
import moment from 'moment';
import { serviceBookingService } from '../serviceBooking/serviceBooking.service';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import mongoose from 'mongoose';

console.log({ first: config.stripe.stripe_api_secret });

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

const addPaymentService = async (payload: any) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction();

  console.log('payment data', payload);

  try {
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
    } = payload;

    const user = await User.findById(customerId).session(session);
    if (!user) {
      throw new AppError(400, 'User is not found!');
    }

    if (user.role !== 'customer') {
      throw new AppError(400, 'User is not authorized as a User!!');
    }

    const buisness = await Business.findOne({ businessId }).session(session);
    if (!buisness) {
      throw new AppError(400, 'Business is not found!');
    }

    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      throw new AppError(400, 'Service is not found!');
    }

    if (!depositAmount || depositAmount <= 0) {
      throw new AppError(
        400,
        'Invalid deposit amount. It must be a positive number.',
      );
    }
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

    const validMethods = ['google_pay', 'apple_pay', 'stripe'];
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



    // const paymentResult = await Payment.create([paymentData], { session });

    // if (!paymentResult) {
    //   throw new AppError(400, 'Payment is not created!');
    // }

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
      // status: 'booking',
      bookingDate,
      duration,
      bookingStartTime: startTime,
      bookingEndTime: endTime,
    };

    console.log('bookingData', bookingData);
    const serviceBookingResult =
      await serviceBookingService.createServiceBooking(bookingData, session);
    console.log({ serviceBookingResult });
    if (!serviceBookingResult) {
      throw new AppError(400, 'Failed to create service booking!');
    }

   




    const paymentInfo = {
      serviceBookingId: serviceBookingResult[0]._id,
      depositAmount: depositAmount,
    };
    let result;

    if (method === 'stripe') {
      const checkoutResult: any = await createCheckout(customerId, paymentInfo);

      if (!checkoutResult) {
        throw new AppError(400, 'Failed to create checkout session!');
      }


      result = checkoutResult;
    } else {

          const paymentData: any = {
            customerId,
            serviceId,
            businessId,
            bookingprice,
            depositAmount,
            dipositParsentage,
            method,
            transactionId: payload.transactionId,
            transactionDate: bookingDate,
            serviceBookingId: serviceBookingResult[0]._id,
            status:"paid",
          };

          if (method === 'google_pay') {
            paymentData.googlePayDetails = googlePayDetails;
          } else if (method === 'apple_pay') {
            paymentData.applePayDetails = applePayDetails;
          }

          
           const paymentResult = await Payment.create([paymentData], {
             session,
           });

           if (!paymentResult) {
             throw new AppError(400, 'Payment is not created!');
           }

 
      const serviceUpdate = await ServiceBooking.findByIdAndUpdate(
        serviceBookingResult[0]._id,
        { paymentStatus: 'upcoming', status: 'booking' },
        { new: true, session },
      );
      if (!serviceUpdate) {
        throw new AppError(400, 'Failed to service Modal Update!');
      }
      result = paymentResult[0];
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    console.error('Transaction Error:', error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(Payment.find(), query)
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
  customerId: string,
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
      const dayData = timeSlots.find((d: any) => d.date === data.date);
      if (dayData) {
        dayData.totalIncome = data.totalIncome;
      }
    } else if (days === '24hour') {
      const hourData = timeSlots.find((h: any) => h.hour === data.hour);
      if (hourData) {
        hourData.totalIncome = data.totalIncome;
      }
    }
  });

  return timeSlots;
};

const createCheckout = async (userId: any, payload: any) => {
  console.log('stripe payment', payload);
  let session = {} as { id: string };

  // const lineItems = products.map((product) => ({
  //   price_data: {
  //     currency: 'usd',
  //     product_data: {
  //       name: 'Order Payment',
  //       description: 'Payment for user order',
  //     },
  //     unit_amount: Math.round(product.price * 100),
  //   },
  //   quantity: product.quantity,
  // }));

  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Amount',
        },
        unit_amount: payload.depositAmount * 100,
      },
      quantity: 1,
    },
  ];

  const sessionData: any = {
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `http://10.0.70.35:8020/api/v1/payment/success`,
    cancel_url: `http://10.0.70.35:8020/api/v1/payment/cancel`,
    line_items: lineItems,
    metadata: {
      userId: String(userId), // Convert userId to string
      serviceBookingId: String(payload.serviceBookingId),
      // products: payload,
    },
  };

  try {
    session = await stripe.checkout.sessions.create(sessionData);

    console.log('session', session.id);
  } catch (error) {
    console.log('Error', error);
  }

  // console.log({ session });
  const { id: session_id, url }: any = session || {};

  console.log({ url });
  console.log({ url });

  return { url};
};


const automaticCompletePayment = async (event: Stripe.Event): Promise<void> => {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const paymentIntentId = session.payment_intent as string;
        const serviceBookingId =
          session.metadata && (session.metadata.serviceBookingId as string);
        const customerId = session.metadata && (session.metadata.userId as string);
          session.metadata && (session.metadata.serviceBookingId as string);
        if (!paymentIntentId) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment Intent ID not found in session',
          );
        }

        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent || paymentIntent.amount_received === 0) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Successful');
        }

       
        const updateServiceBooking = await ServiceBooking.findByIdAndUpdate(
          serviceBookingId,
          { paymentStatus: 'upcoming', status: 'booking' },
          { new: true },
        );


        const paymentData: any = {
          customerId,
          serviceId: updateServiceBooking?.serviceId,
          businessId: updateServiceBooking?.businessId,
          bookingprice: updateServiceBooking?.bookingprice,
          depositAmount: updateServiceBooking?.depositAmount,
          dipositParsentage: updateServiceBooking?.dipositParsentage,
          method: 'stripe',
          transactionId: paymentIntentId,
          transactionDate: updateServiceBooking?.bookingDate,
          serviceBookingId: updateServiceBooking?._id,
          status: 'paid',
          session_id: sessionId,
        };

        const payment = await Payment.create(paymentData);
        

        if (!payment || !updateServiceBooking) {
          console.warn(
            'No Payment  and ServiceBooking record was updated ',
            sessionId,
          );

          throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Updated');
        }

        const deletedServiceBooking = await ServiceBooking.findOneAndDelete({
          customerId, status: 'pending',
        })

        if (deletedServiceBooking) {
          console.log('deleted sarvice booking successfully');
        }

        console.log('Payment completed successfully:', {
          sessionId,
          paymentIntentId,
        });

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientSecret = session.client_secret;
        const sessionId = session.id;

        if (!clientSecret) {
          console.warn('Client Secret not found in session.');
          throw new AppError(httpStatus.BAD_REQUEST, 'Client Secret not found');
        }

        // const payment = await Payment.findOne({ session_id: sessionId });

        // if (payment) {
        //   payment.status = 'Failed';
        //   await payment.save();
        //   console.log('Payment marked as failed:', { clientSecret });
        // } else {
        //   console.warn(
        //     'No Payment record found for Client Secret:',
        //     clientSecret,
        //   );
        // }

        break;
      }

      default:
        // console.log(`Unhandled event type: ${event.type}`);
        // res.status(400).send();
        return;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    // res.status(500).send('Internal Server Error');
  }
};

const paymentRefundService = async (
  amount: number | null,
  payment_intent: string,
) => {
  const refundOptions: Stripe.RefundCreateParams = {
    payment_intent,
  };

  // Conditionally add the `amount` property if provided
  if (amount) {
    refundOptions.amount = Number(amount);
  }

  console.log('refaund options', refundOptions);

  const result = await stripe.refunds.create(refundOptions);
  console.log('refund result ', result);
  return result;
};


export const paymentService = {
  addPaymentService,
  getAllPaymentService,
  singlePaymentService,
  deleteSinglePaymentService,
  getAllPaymentByCustomerService,
  getAllIncomeRatio,
  getAllIncomeRatiobyDays,
  createCheckout,
  automaticCompletePayment,
  paymentRefundService,
};
