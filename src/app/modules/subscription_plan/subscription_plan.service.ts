import Stripe from 'stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TSubscription } from './subscription_plan.interface';
import Subscription from './subscription_plan.model';
import config from '../../config';
import httpStatus from 'http-status';

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

const createSubscriptionService = async (payload: TSubscription) => {
  const type = payload.type;
  payload.duration = type === 'monthly' ? 30 : 365;

  const existingSubscription = await Subscription.findOne({
    type: payload.type,
  });
  if (existingSubscription) {
    throw new AppError(400, 'Subscription already exist!');
  }

  const product = await stripe.products.create({
    name: payload.type,
  });

    if (!product) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create product');
    }

     const price = await stripe.prices.create({
       product: product.id,
       currency: 'usd',
       unit_amount: payload.price && payload.price * 100!,
       recurring: {
         interval: payload.type === 'monthly' ? 'month' : 'year'!,
       },
       tax_behavior: 'inclusive',
     });
     if (!price) {
       throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create price');
     }

    //  const subscriptionData = {
    //    type: payload.type,
    //     price: number;
    //     duration: number;
    //     fetureList: TFetureList[];
    //     isActive: boolean;
    //     stripe_price_id: string;
    //     stripe_product_id: string;
    //  };
   

  const result = await Subscription.create(payload);

  return result;
};

const getAllSubscriptionByAdminService = async (
  query: Record<string, unknown>,
) => {
  const ServiceBookingQuery = new QueryBuilder(Subscription.find({}), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ServiceBookingQuery.modelQuery;
  const meta = await ServiceBookingQuery.countTotal();
  return { meta, result };
};

const getAllSubscriptionService = async (query: Record<string, unknown>) => {
  const SubscriptionQuery = new QueryBuilder(
    Subscription.find({ isActive: true }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await SubscriptionQuery.modelQuery;
  const meta = await SubscriptionQuery.countTotal();

  return { meta, result };
};

const getSingleSubscriptionService = async (id: string) => {
  const result = await Subscription.findById(id);
  if (!result) {
    throw new AppError(404, 'Subscription not found!');
  }
  return result;
};

const deletedSubscriptionService = async (id: string) => {
  const existingSubscription = await Subscription.findById(id);
  if (!existingSubscription) {
    throw new AppError(404, 'Subscription not found!');
  }
  const result = await Subscription.findByIdAndDelete(id);

  return result;
};

const updateSubscriptionActiveDeactiveService = async (id: string) => {
  const existingSubscription = await Subscription.findById(id);
  if (!existingSubscription) {
    throw new AppError(404, 'Subscription not found!');
  }

  const updateStatus = existingSubscription.isActive === true ? false : true;

  const result = await Subscription.findByIdAndUpdate(
    id,
    { isActive: updateStatus },
    {
      new: true,
    },
  );

  return result;
};

export const subscriptionService = {
  createSubscriptionService,
  getAllSubscriptionService,
  getAllSubscriptionByAdminService,
  getSingleSubscriptionService,
  deletedSubscriptionService,
  updateSubscriptionActiveDeactiveService,
};
