import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TSubscription } from './subscription.interface';
import Subscription from './subscription.model';


const createSubscriptionService = async (payload: TSubscription) => {

    const type = payload.type;
     payload.duration = type === 'Monthly' ? 30 : 365;

    const existingSubscription = await Subscription.findOne({ type: payload.type });
    if (existingSubscription) {
      throw new AppError(400, 'Subscription already exist!');
    }
  
  const result = await Subscription.create(payload);

  

  return result;
};

const getAllSubscriptionByAdminService = async (query: Record<string, unknown>) => {
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
  const SubscriptionQuery = new QueryBuilder(Subscription.find({isActive: true}), query)
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
  if(!result){
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

const updateSubscriptionActiveDeactiveService = async (
  id: string,
) => {
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
