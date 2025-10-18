import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import Business from './business.model';
import FavoriteBusiness from '../favorite/favorite.model';
import ServiceBooking from '../serviceBooking/serviceBooking.model';
import {
  generateAvailableSlots,
  generateNewTimeSlot,
  getDayDate,
} from './business.utils';
import Service from '../service/service.model';
import { format } from 'path';
import { UgiToken } from '../ugiToken/ugiToken.model';
// import { parse, isBefore, isAfter } from 'date-fns'; // You can use another library if preferred
import axios from 'axios';
import config from '../../config';
import { notificationService } from '../notification/notification.service';
import SubscriptionPurchase from '../purchestSubscription/purchestSubscription.model';

const createBusinessService = async (files: any, payload: any) => {
  // console.log('businesss-1', { payload });
  payload.businessType = JSON.parse(payload.businessType);
  // // console.log('businesss-2', { payload });

  const businessUser = await User.findById(payload.businessId);
  if (!businessUser) {
    throw new AppError(400, 'You are not business user');
  }
  const existingBusiness = await Business.findOne({
    businessId: payload.businessId,
  });

  if (existingBusiness) {
    throw new AppError(400, 'Business already exist');
  }

  // if (files && files['businessImage'] && files['businessImage'][0]) {
  //   payload['businessImage'] = files['businessImage'][0].path.replace(
  //     /^public[\\/]/,
  //     '',
  //   );
  // }
  if (files && files.businessImage && files.businessImage.length > 0) {
    payload.businessImage = files.businessImage.map((file:any) =>
      file.path.replace(/^public[\\/]/, ''),
    );
  }
  const result = await Business.create(payload);
  // console.log('business create', { result });

  if (!result) {
    const imagePath = `public/${payload.businessImage}`;
    // console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      // console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      // console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }

  return result;
};

const getAllBusinessService = async (query: Record<string, unknown>) => {
  const businessQuery = new QueryBuilder(
    Business.find({}).populate('businessId'),
    query,
  )
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
  const { businessId, date }: any = payload;
  console.log('payload serivce ids', payload);

  // console.log('======slot', payload);
  let serviceIds: string[] = [];

  if (payload.serviceId && typeof payload.serviceId === 'string') {
    serviceIds = (payload.serviceId as string)
      .replace(/^\[|\]$/g, '') // remove the square brackets
      .split(',') // split by comma
      .map((s) => s.trim()); // trim whitespace
  }

console.log('serviceIds', serviceIds);

  // console.log('businessId', businessId, 'date', date);
  const business = await Business.findOne({ businessId });

  if (!business) {
    throw new AppError(404, 'Business is Not Found!!');
  }
let duration = 0;


for (const serviceI of serviceIds) {
  const ser: any = await Service.findById(serviceI); 

  if (!ser) {
    throw new AppError(404, 'Service not found!');
  }
  duration += Number(ser.businessDuration || 0);
}


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


  const durationNum = Number(duration);

  let availableSlots: any = [];
  if (business.specifigDate && business.specifigDate.includes(date)) {
    // console.log('hit hoise ');
    availableSlots = generateAvailableSlots({
      startTime: business.specifigStartTime as string,
      endTime: business.specifigEndTime as string,
      startBreakTime: business.launchbreakStartTime ? business.launchbreakStartTime as string : undefined,
      endBreakTime: business.launchbreakEndTime ? business.launchbreakEndTime as string : undefined,
      bookings,
      duration: durationNum,
      minimumSlotTime: durationNum,
      bookingBreak: Number(business.bookingBreak),
    });
  } else {
    const isAvailable: any = business.availableDaysTime?.find(
      (dayTime) => dayTime.day === dayName,
    );
    // // console.log('====*===**======isAvailable', isAvailable);
    availableSlots = generateAvailableSlots({
      startTime: isAvailable.startTime as string,
      endTime: isAvailable.endTime as string,
      startBreakTime: business.launchbreakStartTime
        ? (business.launchbreakStartTime as string)
        : undefined,
      endBreakTime: business.launchbreakEndTime
        ? (business.launchbreakEndTime as string)
        : undefined,
      bookings,
      duration: durationNum,
      minimumSlotTime: durationNum,
      bookingBreak: Number(business.bookingBreak),
    });
  }

  // // console.log('availableSlots', availableSlots);

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

  return availableSlots;
};

const convertTo24HourFormat11 = (time: any) => {
  // console.log('time', time);
  if (!time || typeof time !== 'string') {
    console.error('Invalid time format:', time);
    throw new Error('Time must be a valid string in the format "hh:mm AM/PM".');
  }
  // console.log('split---1');
  const [hours, minutes] = time.split(/[: ]/);
  // console.log('split---1');
  const isPM = time.includes('PM');
  let hour24 = parseInt(hours, 10) % 12;
  if (isPM) hour24 += 12;
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// const getAllFilterByBusinessService = async (
//   query: Record<string, unknown>,
// ) => {
//   // console.log('service query', query);

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

//   // console.log({ newQuery });
//   const businessQuery = new QueryBuilder(Business.find(newQuery), query)
//     .search(['']) // Add specific searchable fields if needed
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   // console.log({ businessQuery });

//   const result = await businessQuery.modelQuery;
//   const meta = await businessQuery.countTotal();

//   return { meta, result };
// };




// const getAllFilterByBusinessService = async (
//   query: Record<string, unknown>,
//   customerId: string,
// ) => {

//   const {
//     categoryName,
//     subCategoryName,
//     availableDays,
//     timeSlots,
//     page = 1,
//     limit = 10,
//   }: any = query;


//   let formattedAvailableDays = [];
//   let formattedTimeSlots = [];

//   try {
//     formattedAvailableDays = JSON.parse(
//       availableDays.replace(/(\w+)/g, '"$1"'),
//     );
//   } catch (error) {
//     console.error('Error parsing availableDays:', error);
//   }

//   try {
//     formattedTimeSlots = JSON.parse(
//       timeSlots.replace(/^\[/, '["').replace(/]$/, '"]').replace(/, /g, '", "'),
//     );
//   } catch (error) {
//     console.error('Error parsing timeSlots:', error);
//   }

//   const formattedQuery = {
//     categoryName,
//     subCategoryName,
//     availableDays: formattedAvailableDays,
//     timeSlots: formattedTimeSlots,
//   };

//   const skip = (page - 1) * limit;

//   const serviceQuery = await Service.find({
//     categoryName: formattedQuery.categoryName,
//     subCategoryName: formattedQuery.subCategoryName,
//   })
//     .select('businessId')
//     .populate('businessId');

//   console.log('serviceQuery===', serviceQuery);

//   const uniqueServiceQuery = serviceQuery.filter((value, index, self) => {
//     return (
//       self.findIndex(
//         (item) =>
//           item.businessId._id.toString() === value.businessId._id.toString(),
//       ) === index
//     );
//   });

//   console.log('Unique Service Query:', uniqueServiceQuery);

// const businessesWithinRadius = await Business.find({
//   _id: { $in: uniqueServiceQuery.map((service) => service.businessId._id) },
//   location: {
//     $nearSphere: {
//       $geometry: {
//         type: 'Point',
//         coordinates: [90.1225, 21.8225], // [longitude, latitude]
//       },
//       $maxDistance: 20000, // 20 km in meters
//     },
//   },
// });


// console.log('businessesWithinRadius', businessesWithinRadius);




//   let filteredBusinesses: any = [];
//   if (formattedQuery.availableDays) {
//     filteredBusinesses = uniqueServiceQuery.filter(({ businessId }: any) => {
//       if (
//         !businessId ||
//         !businessId.specifigDate ||
//         !businessId.availableDaysTime
//       )
//         return false;
//       return (formattedQuery.availableDays as string[]).some(
//         (day: string) =>
//           businessId.specifigDate.includes(getDayDate(day)) ||
//           businessId.availableDaysTime.some((item: any) => item.day === day),
//       );
//     });
//   }



//   let newTimeSlots;
//   if (formattedQuery.timeSlots) {
//     newTimeSlots = await generateNewTimeSlot(formattedQuery.timeSlots);
//   }


//   let filteredResult: any = [];
//   if (newTimeSlots && typeof newTimeSlots === 'string') {
//     const [queryStartTime, queryEndTime] = newTimeSlots.split(' - ');

//     const queryStart = convertTo24HourFormat11(queryStartTime.trim());
//     const queryEnd = convertTo24HourFormat11(queryEndTime.trim());

//     filteredResult = filteredBusinesses.filter((business: any) => {


//       let startTime: string | undefined, endTime: string | undefined;
//       let specifigstartTime: string | undefined,
//         specifigendTime: string | undefined;

//       if (
//         business.businessId.specifigStartTime?.trim() &&
//         business.businessId.specifigEndTime?.trim() &&
//         business.businessId.specifigDate?.length > 0
//       ) {
       
//         specifigstartTime = convertTo24HourFormat11(
//           business.businessId.specifigStartTime,
//         );
//         specifigendTime = convertTo24HourFormat11(
//           business.businessId.specifigEndTime,
//         );
//       }

//       if (formattedQuery.availableDays.length > 0) {
//         const availableDaysTime = business.businessId.availableDaysTime;
//         availableDaysTime.forEach((item: any) => {
//           if (formattedQuery.availableDays.includes(item.day)) {
//             startTime = convertTo24HourFormat11(item.startTime);
//             endTime = convertTo24HourFormat11(item.endTime);
//           }
//         });
//       }



//       return (
//         (specifigstartTime !== undefined &&
//           specifigendTime !== undefined &&
//           specifigstartTime >= queryStart &&
//           specifigstartTime < queryEnd &&
//           specifigendTime > queryStart) ||
//         (startTime !== undefined &&
//           endTime !== undefined &&
//           startTime >= queryStart &&
//           startTime < queryEnd &&
//           endTime > queryStart)
//       );
//     });
//   }


//   const favoriteData = await FavoriteBusiness.find({ customerId });

//   const enhancedResult = filteredResult.map((business: any) => {
//     const isFavorite = favoriteData.some(
//       (fav) => fav.businessId.toString() === business.businessId._id.toString(),
//     );
//     return { ...business._doc, isFavorite };
//   });


//   const enhancedResult2 = await Promise.all(
//     enhancedResult.map(async (business: any) => {
//       const ugiTokenData = await UgiToken.findOne({
//         businessId: business.businessId.businessId,
//         status: 'accept',
//       });

//       const ugiToken = ugiTokenData ? ugiTokenData.ugiTokenAmount : 'false';
//       return {
//         _id: business._id,
//         businessId: business.businessId, 
//         isFavorite: business.isFavorite,
//         ugiToken, 
//       };
//     }),
//   );

//   const sortedEnhancedResult2 = enhancedResult2.sort((a, b) => {
//     if (b.ugiToken && !a.ugiToken) return 1;
//     if (a.ugiToken && !b.ugiToken) return -1;
//     return 0; 
//   });

//   const total = sortedEnhancedResult2?.length;
//   const totalPage = Math.ceil(total / limit);

//   const paginatedResult = sortedEnhancedResult2.slice(skip, skip + limit);

//   const meta = {
//     page: Number(page),
//     limit: Number(limit),
//     total,
//     totalPage,
//   };

//   return { meta, result: paginatedResult };
// };

const getAllFilterByBusinessService = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const {
    categoryName,
    subCategoryName,
    availableDays,
    timeSlots,
    page = 1,
    limit = 10,
    longitude,
    latitude,
  }: any = query;

  let formattedAvailableDays = [];
  let formattedTimeSlots = [];
  let subCategorys:any = [];

  try {
    formattedAvailableDays = JSON.parse(
      availableDays.replace(/(\w+)/g, '"$1"'),
    );
  } catch (error) {
    console.error('Error parsing availableDays:', error);
  }

  // try {
  //   subCategorys = JSON.parse(subCategoryName.replace(/(\w+)/g, '"$1"'));
  // } catch (error) {
  //   console.error('Error parsing subCategoryName:', error);
  // }


  try {
    subCategorys = JSON.parse(
      subCategoryName
        .replace(/^\[/, '["')
        .replace(/]$/, '"]')
        .replace(/, /g, '", "'),
    );
  } catch (error) {
    console.error('Error parsing subCategoryName:', error);
  }

  try {
    formattedTimeSlots = JSON.parse(
      timeSlots.replace(/^\[/, '["').replace(/]$/, '"]').replace(/, /g, '", "'),
    );
  } catch (error) {
  console.error('Error parsing timeSlots:', error);
  }

  const formattedQuery:any= {
    categoryName,
    subCategoryName: subCategorys,
    availableDays: formattedAvailableDays,
    timeSlots: formattedTimeSlots,
  };


  const skip = (page - 1) * limit;

  const serviceQuery = await Service.find({
    categoryName: formattedQuery.categoryName,
    subCategoryName: formattedQuery.subCategoryName,
  })
    .select('businessId')
    .populate('businessId');

  console.log('serviceQuery===', serviceQuery);

  const uniqueServiceQuery = serviceQuery.filter((value, index, self) => {
    return (
      self.findIndex(
        (item) =>
          item.businessId._id.toString() === value.businessId._id.toString(),
      ) === index
    );
  });

  console.log('Unique Service Query:', uniqueServiceQuery);

  const activeSubscriptions = await SubscriptionPurchase.find({
    endDate: { $gte: new Date() },
    // startDate: { $lte: new Date() },
  }).select('businessUserId');

  // console.log('activeSubscriptions', activeSubscriptions);

const activeBusinessIds = activeSubscriptions.map((sub) => sub.businessUserId.toString());
// console.log('activeBusinessIds', activeBusinessIds);

  const businessesWithinRadius = await Business.find({
    _id: {
      $in: uniqueServiceQuery?.map((service) => service?.businessId?._id),
    },
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude], // [longitude, latitude]
        },
        $maxDistance: 20000, // 20 km in meters
      },
    },
  });

  // console.log('businessesWithinRadius', businessesWithinRadius);


  const subscriptionActiveBusiness = businessesWithinRadius.filter((business) =>
    activeBusinessIds.includes(business.businessId.toString()),
  );


// console.log('subscriptionActiveBusiness', subscriptionActiveBusiness);


  

  let filteredBusinesses: any = [];
  if (formattedQuery.availableDays) {
    filteredBusinesses = subscriptionActiveBusiness.filter(
      (businessId: any) => {
        if (!businessId.specifigDate || !businessId.availableDaysTime)
          return false;
        return (formattedQuery.availableDays as string[]).some(
          (day: string) =>
            businessId.specifigDate.includes(getDayDate(day)) ||
            businessId.availableDaysTime.some((item: any) => item.day === day),
        );
      },
    );
  }

  // console.log('filteredBusinesses', filteredBusinesses);

  let newTimeSlots;
  if (formattedQuery.timeSlots) {
    newTimeSlots = await generateNewTimeSlot(formattedQuery.timeSlots);
  }

  let filteredResult: any = [];
  if (newTimeSlots && typeof newTimeSlots === 'string') {
    const [queryStartTime, queryEndTime] = newTimeSlots.split(' - ');

    const queryStart = convertTo24HourFormat11(queryStartTime.trim());
    const queryEnd = convertTo24HourFormat11(queryEndTime.trim());

    filteredResult = filteredBusinesses.filter((business: any) => {
      let startTime: string | undefined, endTime: string | undefined;
      let specifigstartTime: string | undefined,
        specifigendTime: string | undefined;

      if (
        business.specifigStartTime?.trim() &&
        business.specifigEndTime?.trim() &&
        business.specifigDate?.length > 0
      ) {
        specifigstartTime = convertTo24HourFormat11(business.specifigStartTime);
        specifigendTime = convertTo24HourFormat11(business.specifigEndTime);
      }

      if (formattedQuery.availableDays.length > 0) {
        const availableDaysTime = business.availableDaysTime;
        availableDaysTime.forEach((item: any) => {
          if (formattedQuery.availableDays.includes(item.day)) {
            startTime = convertTo24HourFormat11(item.startTime);
            endTime = convertTo24HourFormat11(item.endTime);
          }
        });
      }

      return (
        (specifigstartTime !== undefined &&
          specifigendTime !== undefined &&
          specifigstartTime >= queryStart &&
          specifigstartTime < queryEnd &&
          specifigendTime > queryStart) ||
        (startTime !== undefined &&
          endTime !== undefined &&
          startTime >= queryStart &&
          startTime < queryEnd &&
          endTime > queryStart)
      );
    });
  }

  const favoriteData = await FavoriteBusiness.find({ customerId });

  const enhancedResult = filteredResult.map((business: any) => {
    const isFavorite = favoriteData.some(
      (fav) => fav.businessId.toString() === business._id.toString(),
    );
    return { ...business._doc, isFavorite };
  });

  console.log('enhancedResult', enhancedResult);

  const enhancedResult2 = await Promise.all(
    enhancedResult.map(async (business: any) => {
      const ugiTokenData = await UgiToken.findOne({
        businessId: business.businessId,
        status: 'accept',
      });

      const ugiToken = ugiTokenData ? ugiTokenData.ugiTokenAmount : 'false';
      return {
        // _id: business._id,
        // businessId: business.businessId,
        // isFavorite: business.isFavorite,
        ...business,
        ugiToken,
      };
    }),
  );

  console.log('enhancedResult2', enhancedResult2);

  const sortedEnhancedResult2 = enhancedResult2.sort((a, b) => {
    if (b.ugiToken && !a.ugiToken) return 1;
    if (a.ugiToken && !b.ugiToken) return -1;
    return 0;
  });

  const total = sortedEnhancedResult2?.length;
  const totalPage = Math.ceil(total / limit);

  const paginatedResult = sortedEnhancedResult2.slice(skip, skip + limit);

  const meta = {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPage,
  };

  return { meta, result: paginatedResult };

// return " ";

};





const getAllFilterByBusinessByPostcodeService = async (postCode: number) => {
  try {
    const apiKey = config.googleApiKey;
    // console.log('api key', apiKey, postCode);
    if (!apiKey) throw new Error('Google API Key is missing!');

    // Geocoding API endpoint
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode},Bangladesh&key=${apiKey}`;
    // const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode}&key=${apiKey}`;

    // Fetching the geocoding data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      // Use the latitude and longitude as needed
      // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      const businessesAll = await Business.find({})
        .select('location.coordinates')
        .limit(1000);
      // console.log('business all', businessesAll);

      const businesses = await Business.find({
        location: {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], 5 / 6378.1], // 20km radius
            // $centerSphere: [[90.426659, 23.780546], 20 / 6378.1], // 20km radius
          },
        },
      });

      // console.log('Nearby Businesses:', businesses);

      return businesses;
    } else {
      throw new Error('Geocoding API error: ' + data.status);
    }
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    throw error;
  }
};

const getSingleBusinessByBusinessIdService = async (businessId: string) => {
  const result = await Business.findOne({ businessId }).populate('businessId');
  //03:15pm //09:25pm


  // console.log(
  //   'launchbreakStartTime ====',
  //   result?.launchbreakStartTime ? 'true' : 'false',
  // );
  // console.log(
  //   'launchbreakEndTime ====',
  //   result?.launchbreakEndTime ? 'true' : 'false',
  // );


  if (!result) {
    throw new AppError(404, 'Business not found!');
  }

  return result;
};

const getSingleBusinessService = async (id: string) => {
  
  const result = await Business.findById(id);
  // console.log({ result });
 
  if (!result) {
    throw new AppError(404, 'Business not found!');
  }
  return result;
};
const getAppSingleBusinessService = async (id: string) => {
  const result: any = await Business.findById(id);
  // console.log({ result });
  if (!result) {
    throw new AppError(404, 'Business not found!');
  }

  let availableDays = result.availableDaysTime?.map((day:any) => day.day);

  // console.log({ availableDays });

  // result.availableDays = availableDaysTime;

  return { ...result._doc, availableDays };
};


// const getBusinessByServiceService = async (businessId: string) => {
//   const result = await Service.find({ businessId });
//   // console.log({ result });
//   if (!result) {
//     throw new AppError(404, 'Business not found!');
//   }
//   return result;
// };

const getBusinessByServiceService = async (
  query: Record<string, unknown>,
  businessId: string,
) => {
  // console.log({ businessId });
  console.log('query******************', query);
  
if (typeof query.subCategoryName === 'string') {
  query.subCategoryName = (query.subCategoryName as string)
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim());
}
 console.log('query****************** down', query);

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
  // console.log('id', businessId);
  // console.log('payload', payload);
  // Check if the document exists
  console.log('payload==', payload);

  if(payload.businessType && typeof payload.businessType === 'string'){
    payload.businessType = JSON.parse(payload.businessType);
  }

  
  console.log('payload==2', payload);
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
    // console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      // console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      // console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }

  // console.log({ result });
  return result;
};

const updateAvailableBusinessTimeService = async (
  businessId: string,
  payload: any,
) => {
  const existingBusiness = await Business.findOne({ businessId });
  console.log('existingBusiness==', existingBusiness);
  console.log('payload==', payload);
  if (!existingBusiness) {
    throw new AppError(404, 'Business not found!');
  }

  const result = await Business.findOneAndUpdate({ businessId }, payload, {
    new: true,
  });
  console.log('result==*****', result);

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
    // console.log('File path to delete:', imagePath);

    try {
      await access(imagePath); // Check if the file exists
      // console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      // console.log('File successfully deleted:', imagePath);
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
  getAppSingleBusinessService,
  deletedBusinessService,
  updateBusinessService,
  updateAvailableBusinessTimeService,
  getBusinessByServiceService,
  getAllFilterByBusinessByPostcodeService,
};
