import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';import { TPurchestSubscription } from './purchestSubscription.interface';
import SubscriptionPurchase from './purchestSubscription.model';
;

const createPurchestSubscriptionService = async (payload: TPurchestSubscription) => {


  const result = await SubscriptionPurchase.create(payload);

  return result;
};

const getAllPurchestSubscriptionByAdminService = async (
  query: Record<string, unknown>,
) => {
  const ServiceBookingQuery = new QueryBuilder(
    SubscriptionPurchase.find({}),
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

const getAllPurchestSubscriptionService = async (query: Record<string, unknown>) => {
  const PurchestSubscriptionQuery = new QueryBuilder(
    SubscriptionPurchase.find({ isActive: true }),
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
  const result = await SubscriptionPurchase.findById(id);
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

export const purchestsubscriptionService = {
  createPurchestSubscriptionService,
  getAllPurchestSubscriptionService,
  getAllPurchestSubscriptionByAdminService,
  getSinglePurchestSubscriptionService,
  deletedPurchestSubscriptionService,
  updatePurchestSubscriptionActiveDeactiveService,
};
