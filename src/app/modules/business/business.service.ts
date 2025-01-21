import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import Business from './business.model';
import FavoriteBusiness from '../favorite/favorite.model';
import ServiceBooking from '../serviceBooking/serviceBooking.model';
import { generateAvailableSlots, generateNewTimeSlot } from './business.utils';
import Service from '../service/service.model';
// import { parse, isBefore, isAfter } from 'date-fns'; // You can use another library if preferred

const createBusinessService = async (files: any, payload: any) => {
  // console.log("businesss-1",{payload})
  payload.businessType = JSON.parse(payload.businessType);
  // console.log('businesss-2', { payload });

    const businessUser = await User.findById(payload.businessId);
    if (!businessUser) {
        throw new AppError(400, 'You are not business user');    
    };
    const existingBusiness = await Business.findOne({
      businessName: payload.businessName,
    });

    if (existingBusiness) {
      throw new AppError(400, 'Business already exist');
    }


      if (files && files['businessImage'] && files['businessImage'][0]) {
        payload['businessImage'] = files['businessImage'][0].path.replace(
          /^public[\\/]/,
          '',
        );
      }
  const result = await Business.create(payload);

  if (!result) {
    const imagePath = `public/${payload.businessImage}`;
    console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }

  return result;
};


const getAllBusinessService = async (query: Record<string, unknown>) => {
  const businessQuery = new QueryBuilder(Business.find({}), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await businessQuery.modelQuery;
  const meta = await businessQuery.countTotal();
  return { meta, result };
};


const getBusinessAvailableSlots = async (payload: any) => {
  const { businessId, date, serviceId }: any = payload;

  console.log('businessId', businessId, 'date', date);
  const business = await Business.findById(businessId);

  if (!business) {
    throw new AppError(404, 'Business is Not Found!!');
  }

  const service:any = await Business.findById(serviceId);

  if (!service) {
    throw new AppError(404, 'service is Not Found!!');
  }

  // Define start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Find bookings within the specified date range
  const bookings = await ServiceBooking.find({
    businessId,
    bookingDate: {
      $gte: startOfDay, // Start of the day
      $lt: endOfDay, // End of the day
    },
  }).select('bookingStartTime bookingEndTime bookingDate');


  console.log('startTime  ', business.businessStartTime);
  console.log('endTime  ', business.businessEndTime);
  console.log('startBreakTime  ', business.launchbreakStartTime);
  console.log('endBreakTime  ', business.launchbreakEndTime);
  console.log('bookingbreack', business.bookingBreak);
  const durationNum = Number(service.businessDuration);
  console.log({ durationNum });
  console.log({ bookings });

  const availableSlots = generateAvailableSlots({
    startTime: business.businessStartTime,
    endTime: business.businessEndTime,
    startBreakTime: business.launchbreakStartTime,
    endBreakTime: business.launchbreakEndTime,
    bookings,
    duration: durationNum,
    minimumSlotTime: durationNum,
    bookingBreak:business.bookingBreak
  });

  // console.log({ availableSlots });

  return  availableSlots ;
};


const convertTo24HourFormat11 = (time:any) => {
  console.log('time', time);
   if (!time || typeof time !== 'string') {
     console.error('Invalid time format:', time);
     throw new Error(
       'Time must be a valid string in the format "hh:mm AM/PM".',
     );
   }
   console.log('split---1')
  const [hours, minutes] = time.split(/[: ]/);
    console.log('split---1');
  const isPM = time.includes('PM');
  let hour24 = parseInt(hours, 10) % 12;
  if (isPM) hour24 += 12;
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// const getAllFilterByBusinessService = async (
//   query: Record<string, unknown>,
// ) => {
//   console.log('service query', query);

//   const { categoryName, subCategoryName, availableDays, timeSlots }:any = query;

//   // Create a new query object with provided filters
//   const newQuery: Record<string, unknown> = {};
//   if (categoryName) newQuery.categoryName = categoryName;
//   if (subCategoryName) newQuery.subCategoryName = subCategoryName;
//   if (availableDays) newQuery.availableDays = availableDays;

//   const [queryStartTime, queryEndTime] = timeSlots.split(' - ');
//   const queryStart = convertTo24HourFormat(queryStartTime);
//   const queryEnd = convertTo24HourFormat(queryEndTime);

//   const result = Business.filter((business) => {
//     const businessStart = convertTo24HourFormat(business.businessStartTime);
//     const businessEnd = convertTo24HourFormat(business.businessEndTime);

//     return (
//       businessStart >= queryStart &&
//       businessStart < queryEnd &&
//       businessEnd > queryStart
//     );
//   });
    
//   console.log({ newQuery });
//   const businessQuery = new QueryBuilder(Business.find(newQuery), query)
//     .search(['']) // Add specific searchable fields if needed
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   console.log({ businessQuery });

//   const result = await businessQuery.modelQuery;
//   const meta = await businessQuery.countTotal();

//   return { meta, result };
// };

const getAllFilterByBusinessService = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  console.log('Service query:', query);

  const {
    categoryName,
    subCategoryName,
    availableDays,
    timeSlots,
    page = 1,
    limit = 10,
  }: any = query;

  const newQuery: Record<string, unknown> = {};
  if (availableDays) {
    newQuery.availableDays = Array.isArray(availableDays)
      ? availableDays
      : [availableDays];
  }

  // Pagination variables
  const skip = (page - 1) * limit;

  const serviceQuery = await Service.find({
    subCategoryName,
    categoryName,
  })
    .select('businessId')
    .populate('businessId');


let filteredBusinesses = serviceQuery;
 if(newQuery.availableDays){
   filteredBusinesses = serviceQuery.filter(({ businessId }: any) => {
    console.log('Business Available Days:', businessId?.availableDays);
    if (!businessId || !businessId.availableDays) return false;
    return (newQuery.availableDays as string[])?.some((day: string) =>
      businessId.availableDays.includes(day),
    );
  });
 }


  console.log("oo",filteredBusinesses);
  // console.log({filteredBusinesses});


let newTimeSlots;
  if(timeSlots){
     const queryAvailableSlots = Array.isArray(timeSlots)
       ? timeSlots
       : [timeSlots];

        newTimeSlots = await generateNewTimeSlot(queryAvailableSlots);

  }

 

  // const timeSlote = "10:00 AM - 11:00 AM";
  

  console.log('mmm',{ timeSlots });
  console.log('nnn', { newTimeSlots });




  // Handle timeSlots filtering

  let filteredResult = [];
  if (newTimeSlots && typeof newTimeSlots === 'string') {
    const [queryStartTime, queryEndTime] = newTimeSlots.split(' - ');
    console.log({ queryStartTime });
    console.log({ queryEndTime });
    const queryStart = convertTo24HourFormat11(queryStartTime.trim());
    console.log({ queryStart });
    const queryEnd = convertTo24HourFormat11(queryEndTime.trim());
    console.log({ queryEnd });

    // Fetch all businesses and filter by timeSlots
    // const allBusinesses = filteredBusinesses;// Fetch businesses matching initial filters
    console.log('in filter', filteredBusinesses);

    filteredResult = filteredBusinesses.filter((business: any) => {
      console.log('==', business);
      console.log('==1', business.businessStartTime);
      console.log('==2', business.businessEndTime);
      const businessStart = convertTo24HourFormat11(
        business.businessId.businessStartTime,
      );
      const businessEnd = convertTo24HourFormat11(
        business.businessId.businessEndTime,
      );

      return (
        businessStart >= queryStart && // Start time should be >= time slot start
        businessStart < queryEnd && // Start time should be < time slot end
        businessEnd > queryStart // End time should overlap with time slot start
      );
    });
  } else {
    // If no timeSlots filter, fetch businesses matching other filters
    filteredResult = filteredBusinesses;
  }

  console.log({ filteredResult });
  // console.log('customerId', customerId);

  // Fetch favorite data for the customer

  const favoriteData = await FavoriteBusiness.find({ customerId });
  console.log({ favoriteData });
  // Add isFavorite property to businesses
  const enhancedResult = filteredResult.map((business: any) => {
    const isFavorite = favoriteData.some(
      (fav) => fav.businessId.toString() === business._id.toString(),
    );
    return { ...business._doc, isFavorite }; // Include isFavorite as true/false
  });

  // console.log('Filtered result with favorites:', enhancedResult);

  // Calculate pagination metadata
  const total = enhancedResult?.length;
  const totalPage = Math.ceil(total / limit);

  // Apply pagination to the enhanced result
  const paginatedResult = enhancedResult.slice(skip, skip + limit);
  console.log({ paginatedResult });

  const meta = {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPage,
  };

  return { meta, result: paginatedResult };
  // return filteredBusinesses;
};




const getSingleBusinessByBusinessIdService = async (businessId: string) => {
  const result = await Business.findOne({ businessId });
  console.log({ result });
  if (!result) {
    throw new AppError(404, 'Business not found!');
  }
  return result;
};

const getSingleBusinessService = async (id: string) => {
  const result = await Business.findById(id );
  console.log({ result });
  if (!result) {
    throw new AppError(404, 'Business not found!');
  }
  return result;
};



const updateBusinessService = async (
  businessId: string,
  files: any,
  payload: any,
) => {
  console.log('id', businessId);
  console.log('payload', payload);
  // Check if the document exists
  const existingBusiness = await Business.findOne({ businessId });
  if (!existingBusiness) {
    throw new AppError(404, 'Business not found!');
  }

  // Validate files and process image
  if (files && files['businessImage'] && files['businessImage'][0]) {
    const BusinessImage = files['businessImage'][0];
    payload.businessImage = BusinessImage.path.replace(/^public[\\/]/, '');
  }

  const result = await Business.findOneAndUpdate({ businessId }, payload, {
    new: true,
  });

  if (result) {
    const imagePath = `public/${existingBusiness.businessImage}`;
    console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }

  console.log({ result });
  return result;
};


const updateAvailableBusinessTimeService = async (
  businessId: string,
  payload: any,
) => {
  const existingBusiness = await Business.findOne({ businessId });
  if (!existingBusiness) {
    throw new AppError(404, 'Business not found!');
  }

 
    const result = await Business.findOneAndUpdate({ businessId }, payload, {
      new: true,
    });

 
  return result;
};

const deletedBusinessService = async (businessId: string) => {
  const existingBusiness = await Business.findOne({ businessId });
  if (!existingBusiness) {
    throw new AppError(404, 'Business not found!');
  }
  const result = await Business.findOneAndDelete({ businessId });
  if (result) {
    const imagePath = `public/${existingBusiness.businessImage}`;
    console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }
  return result;
};

export const businessService = {
  createBusinessService,
  getAllBusinessService,
  getBusinessAvailableSlots,
  getAllFilterByBusinessService,
  getSingleBusinessByBusinessIdService,
  getSingleBusinessService,
  deletedBusinessService,
  updateBusinessService,
  updateAvailableBusinessTimeService,
};
