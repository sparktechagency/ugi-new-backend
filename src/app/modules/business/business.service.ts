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
import { format } from 'path';
import { UgiToken } from '../ugiToken/ugiToken.model';
// import { parse, isBefore, isAfter } from 'date-fns'; // You can use another library if preferred
import axios from 'axios';
import config from '../../config';
import { notificationService } from '../notification/notification.service';

const createBusinessService = async (files: any, payload: any) => {
  // console.log("businesss-1",{payload})
  payload.businessType = JSON.parse(payload.businessType);
  // console.log('businesss-2', { payload });

    const businessUser = await User.findById(payload.businessId);
    if (!businessUser) {
        throw new AppError(400, 'You are not business user');    
    };
    const existingBusiness = await Business.findOne({
      businessId: payload.businessId,
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
  console.log("business create",{ result });

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
    .search(['businessName', 'businessDescription'])
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
  const business = await Business.findOne({businessId});

  if (!business) {
    throw new AppError(404, 'Business is Not Found!!');
  }

  const service:any = await Service.findById(serviceId);

  if (!service) {
    throw new AppError(404, 'service is Not Found!!');
  }

  // console.log({ service });

  const dateDay = new Date(date).getDay();

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];


  const dayName = daysOfWeek[dateDay];
  // Define start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const bookings = await ServiceBooking.find({
    businessId,
    bookingDate: {
      $gte: startOfDay, 
      $lt: endOfDay, 
    },
  }).select('bookingStartTime bookingEndTime bookingDate');


  const durationNum = Number(service.businessDuration);


  let availableSlots: any = [];
  if(business.specialDays && business.specialDays.includes(dayName)){
     availableSlots = generateAvailableSlots({
       startTime: business.specialStartTime as string,
       endTime: business.specialEndTime as string,
       startBreakTime: business.launchbreakStartTime as string,
       endBreakTime: business.launchbreakEndTime as string,
       bookings,
       duration: durationNum,
       minimumSlotTime: durationNum,
       bookingBreak: business.bookingBreak,
     }); 
}else{
   availableSlots = generateAvailableSlots({
    startTime: business.businessStartTime as string,
    endTime: business.businessEndTime as string,
    startBreakTime: business.launchbreakStartTime as string,
    endBreakTime: business.launchbreakEndTime as string,
    bookings,
    duration: durationNum,
    minimumSlotTime: durationNum,
    bookingBreak: business.bookingBreak,
  });
}



  // const availableSlots = generateAvailableSlots({
  //   startTime: business.businessStartTime,
  //   endTime: business.businessEndTime,
  //   startBreakTime: business.launchbreakStartTime,
  //   endBreakTime: business.launchbreakEndTime,
  //   bookings,
  //   duration: durationNum,
  //   minimumSlotTime: durationNum,
  //   bookingBreak:business.bookingBreak
  // });

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
  console.log('Service query:==', query);

  const {
    categoryName,
    subCategoryName,
    availableDays,
    timeSlots,
    page = 1,
    limit = 10,
  }: any = query;

  console.log('****');

  let formattedAvailableDays = [];
  let formattedTimeSlots = [];

  try {
    formattedAvailableDays = JSON.parse(
      availableDays.replace(/(\w+)/g, '"$1"'),
    );
  } catch (error) {
    console.error('Error parsing availableDays:', error);
  }

  try {
    formattedTimeSlots = JSON.parse(
      timeSlots.replace(/^\[/, '["').replace(/]$/, '"]').replace(/, /g, '", "'),
    );
  } catch (error) {
    console.error('Error parsing timeSlots:', error);
  }

  const formattedQuery = {
    categoryName,
    subCategoryName,
    availableDays: formattedAvailableDays,
    timeSlots: formattedTimeSlots,
  };

  console.log({ formattedQuery });

  // Pagination variables
  const skip = (page - 1) * limit;

  const serviceQuery = await Service.find({
    categoryName: formattedQuery.categoryName,
    subCategoryName: formattedQuery.subCategoryName,
  })
    .select('businessId')
    .populate('businessId');

  console.log('serviceQuery===', serviceQuery);

  let filteredBusinesses: any = [];
  if (formattedQuery.availableDays) {
    filteredBusinesses = serviceQuery.filter(({ businessId }: any) => {
      console.log('Business Available Days:', businessId?.availableDays);
      if (!businessId || !businessId.availableDays || !businessId.specialDays)
        return false;
      return (formattedQuery.availableDays as string[]).some(
        (day: string) =>
          businessId.availableDays.includes(day) ||
          businessId.specialDays.includes(day),
      );
    });
  }

  console.log('oo', filteredBusinesses);
  // console.log({filteredBusinesses});

  let newTimeSlots;
  if (formattedQuery.timeSlots) {
    newTimeSlots = await generateNewTimeSlot(formattedQuery.timeSlots);
  }

  // const timeSlote = "10:00 AM - 11:00 AM";

  console.log('timeSlots', { timeSlots });
  console.log('newTimeSlots', { newTimeSlots });

  // Handle timeSlots filtering

  // Handle timeSlots filtering
  let filteredResult: any = [];
  if (newTimeSlots && typeof newTimeSlots === 'string') {
    const [queryStartTime, queryEndTime] = newTimeSlots.split(' - ');
    console.log({ queryStartTime, queryEndTime });

    const queryStart = convertTo24HourFormat11(queryStartTime.trim());
    const queryEnd = convertTo24HourFormat11(queryEndTime.trim());
    console.log({ queryStart, queryEnd });

    // Filter businesses based on time slots
    filteredResult = filteredBusinesses.filter((business: any) => {
      console.log('Business:', business);

      let startTime, endTime;
      console.log('specialStartTime', business.businessId.specialStartTime);
      console.log('specialEndTime', business.businessId.specialEndTime);

      if (
        business.businessId.specialStartTime?.trim() &&
        business.businessId.specialEndTime?.trim() &&
        business.businessId.specialDays?.length > 0
      ) {
        console.log('business special', business);
        console.log('business.specialStartTime', business.specialStartTime);
        console.log('business.specialEndTime', business.specialEndTime);
        // Use special times if available
        startTime = convertTo24HourFormat11(
          business.businessId.specialStartTime,
        );
        endTime = convertTo24HourFormat11(business.businessId.specialEndTime);
      } else {
        console.log('business businessTime', business);
        startTime = convertTo24HourFormat11(
          business.businessId.businessStartTime,
        );
        endTime = convertTo24HourFormat11(business.businessId.businessEndTime);
      }

      console.log({ startTime, endTime });

      // Check if business falls within the queried time slot
      return (
        startTime >= queryStart && // Start time should be >= query start
        startTime < queryEnd && // Start time should be < query end
        endTime > queryStart // End time should overlap with query start
      );
    });
  }
  // else {
  //   // If no timeSlots filter, fetch businesses matching other filters
  //   filteredResult = filteredBusinesses;
  // }

  console.log({ filteredResult });

  console.log('963', filteredResult);
  // console.log('customerId', customerId);

  // Fetch favorite data for the customer

  const favoriteData = await FavoriteBusiness.find({ customerId });

  const enhancedResult = filteredResult.map((business: any) => {
    const isFavorite = favoriteData.some(
      (fav) => fav.businessId.toString() === business.businessId._id.toString(),
    );
    return { ...business._doc, isFavorite };
  });

  console.log('enhancedResult', enhancedResult);

  // const ugiTokenData = await UgiToken.findOne({ businessId: });
  // console.log({ favoriteData });
  // Add isFavorite property to businesses
  const enhancedResult2 = await Promise.all(
    enhancedResult.map(async (business: any) => {
      // Fetch ugiToken data asynchronously
      const ugiTokenData = await UgiToken.findOne({
        businessId: business.businessId.businessId,
        status:"accept",
      });

      const ugiToken = ugiTokenData ? ugiTokenData.ugiTokenAmount : 'false';
      return {
        _id: business._id,
        businessId: business.businessId, // Keep the nested businessId object
        isFavorite: business.isFavorite,
        ugiToken, // Add the new ugiToken field
      };
    }),
  );

  // Sort businesses to place those with ugiToken at the top
  const sortedEnhancedResult2 = enhancedResult2.sort((a, b) => {
    // Place businesses with ugiToken at the top
    if (b.ugiToken && !a.ugiToken) return 1;
    if (a.ugiToken && !b.ugiToken) return -1;
    return 0; // If both have or don't have ugiToken, maintain original order
  });

  console.log('enhancedResult2', sortedEnhancedResult2);
  // console.log('Filtered result with favorites:', enhancedResult);

  // Calculate pagination metadata
  const total = sortedEnhancedResult2?.length;
  const totalPage = Math.ceil(total / limit);

  // Apply pagination to the enhanced result
  const paginatedResult = sortedEnhancedResult2.slice(skip, skip + limit);
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


const getAllFilterByBusinessByPostcodeService = async (
  postCode: number,
) => {
  try {
    const apiKey = config.googleApiKey;
    console.log('api key', apiKey, postCode);
    if (!apiKey) throw new Error('Google API Key is missing!');

    // Geocoding API endpoint
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode},Bangladesh&key=${apiKey}`;
    // const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode}&key=${apiKey}`;

    // Fetching the geocoding data
    const response = await axios.get(apiUrl);
    console.log('response', response);
    const data = response.data;
    console.log('goole api response', data);

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      // Use the latitude and longitude as needed
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      const businesses = await Business.find({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 20 / 6378.1], // 20km radius
          },
        },
      });

      console.log('Nearby Businesses:', businesses);

      return businesses;

    } else {
      throw new Error('Geocoding API error: ' + data.status);
    }


    // const latitude = 23.76124;
    // const longitude = 90.4207;

      // const businesses = await Business.find({
      //   location: {
      //     $geoWithin: {
      //       $centerSphere: [[longitude, latitude], 20 / 6378.1], // 20km radius
      //     },
      //   },
      // });

      // return businesses;
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    throw error;
  }
};



const getSingleBusinessByBusinessIdService = async (businessId: string) => {
  const result = await Business.findOne({ businessId });
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


// const getBusinessByServiceService = async (businessId: string) => {
//   const result = await Service.find({ businessId });
//   console.log({ result });
//   if (!result) {
//     throw new AppError(404, 'Business not found!');
//   }
//   return result;
// };

const getBusinessByServiceService = async (
  query: Record<string, unknown>,
  businessId: string,
) => {
  console.log({ businessId });
  const businessQuery = new QueryBuilder(Service.find({ businessId }), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await businessQuery.modelQuery;
  const meta = await businessQuery.countTotal();
  return { meta, result };
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
  getBusinessByServiceService,
  getAllFilterByBusinessByPostcodeService,
};
