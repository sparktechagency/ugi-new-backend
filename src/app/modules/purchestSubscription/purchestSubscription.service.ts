import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import { TPurchestSubscription } from './purchestSubscription.interface';
import SubscriptionPurchase from './purchestSubscription.model';

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

const createPurchestSubscriptionService = async (
  payload: TPurchestSubscription,
) => {
  console.log('payload', payload);
 
  const usersRunningSubscriptions = await SubscriptionPurchase.find({
    businessUserId: payload.businessUserId,
    endDate: { $gte: new Date() },
  });

  if (usersRunningSubscriptions.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already have an active subscription!!',
    );
  }


    const alreadyPurchestedSubscription = await SubscriptionPurchase.findOne({
      businessUserId: payload.businessUserId,
      type: payload.type,
    });

    let result ;

    if (alreadyPurchestedSubscription) {
       result = await SubscriptionPurchase.findOneAndUpdate(
        { businessUserId: payload.businessUserId, type: payload.type },
        {
          $set: {
            amount: payload.amount,
            startDate: payload.startDate,
            endDate: payload.endDate,
          },
        },
        {
          new: true,
        },
      );
    }else{
      result = await SubscriptionPurchase.create(payload);
    }

  return result;
};



const getRunningPurchestSubscriptionByBusinessmanService = async (
  businessUserId: string,
) => {
  const result = await SubscriptionPurchase.find({ businessUserId });


  const currentRunningSubscription = result.find(
    (item: any) => item.endDate >= new Date(),
  );

  if (!currentRunningSubscription) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have no active subscription!!',
    );
  }


  return currentRunningSubscription;
};



const getAllPurchestSubscriptionService = async (
  query: Record<string, unknown>,
  businessUserId: string,
) => {
  // console.log('dsfafsafaf', businessUserId);
  const PurchestSubscriptionQuery = new QueryBuilder(
    SubscriptionPurchase.find({
      businessUserId,
      endDate: { $lt: new Date() },
    }).populate({
      path: 'businessUserId',
      select: 'fullName email image role',
    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PurchestSubscriptionQuery.modelQuery;
  const meta = await PurchestSubscriptionQuery.countTotal();

  return { meta, result };
};

const getSinglePurchestSubscriptionService = async (id: string) => {
  const result = await SubscriptionPurchase.findById(id).populate({
    path: 'businessUserId',
    select: 'fullName email image role',
  });
  if (!result) {
    throw new AppError(404, 'PurchestSubscription not found!');
  }
  return result;
};

const deletedPurchestSubscriptionService = async (id: string) => {
  const existingPurchestSubscription = await SubscriptionPurchase.findById(id);
  if (!existingPurchestSubscription) {
    throw new AppError(404, 'PurchestSubscription not found!');
  }
  const result = await SubscriptionPurchase.findByIdAndDelete(id);

  return result;
};

const updatePurchestSubscriptionActiveDeactiveService = async (id: string) => {
  const existingPurchestSubscription = await SubscriptionPurchase.findById(id);
  if (!existingPurchestSubscription) {
    throw new AppError(404, 'PurchestSubscription not found!');
  }

  const result = await SubscriptionPurchase.findByIdAndUpdate(id, {
    new: true,
  });

  return result;
};

// const createCheckout = async (userId: any, payload: any) => {
//   let session = {} as { id: string };

//   const lineItems = [
//     {
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: 'Amount',
//         },
//         unit_amount: payload.price * 100,
//       },

//       quantity: 1,
//     },
//   ];

//   const sessionData: any = {
//     payment_method_types: ['card'],
//     mode: 'subscription',
//     success_url: `http://10.0.70.35:8075/api/v1/payment/success`,
//     cancel_url: `http://10.0.70.35:8075/api/v1/payment/cancel`,
//     line_items: lineItems,
//     metadata: {
//       userId: String(userId),
//       subscriptionId: String(payload.subscriptionId),
//     },
//   };

//   try {
//     session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'subscription',
//       line_items: [{}],
//     });
//   } catch (error) {}

//   const { id: session_id, url }: any = session || {};

//   return { url };
// };



export const purchestsubscriptionService = {
  createPurchestSubscriptionService,
  getAllPurchestSubscriptionService,
  getRunningPurchestSubscriptionByBusinessmanService,
  getSinglePurchestSubscriptionService,
  deletedPurchestSubscriptionService,
  updatePurchestSubscriptionActiveDeactiveService,
};
