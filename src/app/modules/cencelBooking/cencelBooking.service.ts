// import { Types } from 'mongoose';
// import QueryBuilder from '../../builder/QueryBuilder';
// import AppError from '../../error/AppError';
// import { User } from '../user/user.models';
// import { TCencelBooking } from './cencelBooking.interface';
// import CencelBooking from './cencelBooking.model';


// const createCencelBooking = async (payload: TCencelBooking) => {
//   const result = await CencelBooking.create(payload);
//   return result;
// };

// const getAllCencelBookingByAdminQuery = async (
//   query: Record<string, unknown>,
// ) => {
//   const cencelBookingQuery = new QueryBuilder(
//     CencelBooking.find({ }),
//     query
//   )
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await cencelBookingQuery.modelQuery;
//   const meta = await cencelBookingQuery.countTotal();
//   return { meta, result };
// };

// const getSingleCencelBooking = async (id: string) => {
//   const result = await CencelBooking.findById(id);
//   return result;
// };

// const paidCencelBooking = async (id: string, userId: string) => {
//   // Fetch the user by ID
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError(404, 'Admin not found!');
//   }

//   if (user.role !== 'admin') {
//     throw new AppError(404, 'Admin not found!');
//   }

//   const cencelBooking = await CencelBooking.findById(id);
//   if (!cencelBooking) {
//     throw new AppError(404, 'CencelBooking not found!');
//   }

//   cencelBooking.status = 'paid';
//   const result = await cencelBooking.save();
//   return result;
  
// };

// export const cencelBookingCencel = {
//   createCencelBooking,
//   getAllCencelBookingByAdminQuery,
//   getSingleCencelBooking,
//   paidCencelBooking,
// };
