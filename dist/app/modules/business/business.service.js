"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const promises_1 = require("fs/promises");
const promises_2 = require("fs/promises");
const business_model_1 = __importDefault(require("./business.model"));
const favorite_model_1 = __importDefault(require("../favorite/favorite.model"));
const serviceBooking_model_1 = __importDefault(require("../serviceBooking/serviceBooking.model"));
const business_utils_1 = require("./business.utils");
const service_model_1 = __importDefault(require("../service/service.model"));
const ugiToken_model_1 = require("../ugiToken/ugiToken.model");
// import { parse, isBefore, isAfter } from 'date-fns'; // You can use another library if preferred
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const purchestSubscription_model_1 = __importDefault(require("../purchestSubscription/purchestSubscription.model"));
const createBusinessService = (files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('businesss-1', { payload });
    payload.businessType = JSON.parse(payload.businessType);
    // // console.log('businesss-2', { payload });
    const businessUser = yield user_models_1.User.findById(payload.businessId);
    if (!businessUser) {
        throw new AppError_1.default(400, 'You are not business user');
    }
    const existingBusiness = yield business_model_1.default.findOne({
        businessId: payload.businessId,
    });
    if (existingBusiness) {
        throw new AppError_1.default(400, 'Business already exist');
    }
    if (files && files['businessImage'] && files['businessImage'][0]) {
        payload['businessImage'] = files['businessImage'][0].path.replace(/^public[\\/]/, '');
    }
    const result = yield business_model_1.default.create(payload);
    // console.log('business create', { result });
    if (!result) {
        const imagePath = `public/${payload.businessImage}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath); // Check if the file exists
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    return result;
});
const getAllBusinessService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const businessQuery = new QueryBuilder_1.default(business_model_1.default.find({}).populate('businessId'), query)
        .search(['businessName', 'businessDescription'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield businessQuery.modelQuery;
    const meta = yield businessQuery.countTotal();
    return { meta, result };
});
const getBusinessAvailableSlots = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { businessId, date, serviceId } = payload;
    // console.log('======slot', payload);
    // console.log('businessId', businessId, 'date', date);
    const business = yield business_model_1.default.findOne({ businessId });
    if (!business) {
        throw new AppError_1.default(404, 'Business is Not Found!!');
    }
    const service = yield service_model_1.default.findById(serviceId);
    if (!service) {
        throw new AppError_1.default(404, 'service is Not Found!!');
    }
    // // console.log({ service });
    const dateDay = new Date(date).getDay();
    // // console.log('=======dateDay', dateDay);
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
    const bookings = yield serviceBooking_model_1.default.find({
        businessId,
        bookingDate: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
    }).select('bookingStartTime bookingEndTime bookingDate');
    // // console.log('=====booking', bookings);
    const durationNum = Number(service.businessDuration);
    // // console.log('=========durationNum', durationNum);
    // // console.log('=========dayName', dayName);
    let availableSlots = [];
    if (business.specifigDate && business.specifigDate.includes(date)) {
        // console.log('hit hoise ');
        availableSlots = (0, business_utils_1.generateAvailableSlots)({
            startTime: business.specifigStartTime,
            endTime: business.specifigEndTime,
            startBreakTime: business.launchbreakStartTime ? business.launchbreakStartTime : undefined,
            endBreakTime: business.launchbreakEndTime ? business.launchbreakEndTime : undefined,
            bookings,
            duration: durationNum,
            minimumSlotTime: durationNum,
            bookingBreak: Number(business.bookingBreak),
        });
    }
    else {
        const isAvailable = (_a = business.availableDaysTime) === null || _a === void 0 ? void 0 : _a.find((dayTime) => dayTime.day === dayName);
        // // console.log('====*===**======isAvailable', isAvailable);
        availableSlots = (0, business_utils_1.generateAvailableSlots)({
            startTime: isAvailable.startTime,
            endTime: isAvailable.endTime,
            startBreakTime: business.launchbreakStartTime
                ? business.launchbreakStartTime
                : undefined,
            endBreakTime: business.launchbreakEndTime
                ? business.launchbreakEndTime
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
    // // console.log({ availableSlots });
    return availableSlots;
});
const convertTo24HourFormat11 = (time) => {
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
    if (isPM)
        hour24 += 12;
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
const getAllFilterByBusinessService = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryName, subCategoryName, availableDays, timeSlots, page = 1, limit = 10, longitude, latitude, } = query;
    let formattedAvailableDays = [];
    let formattedTimeSlots = [];
    try {
        formattedAvailableDays = JSON.parse(availableDays.replace(/(\w+)/g, '"$1"'));
    }
    catch (error) {
        console.error('Error parsing availableDays:', error);
    }
    try {
        formattedTimeSlots = JSON.parse(timeSlots.replace(/^\[/, '["').replace(/]$/, '"]').replace(/, /g, '", "'));
    }
    catch (error) {
        console.error('Error parsing timeSlots:', error);
    }
    const formattedQuery = {
        categoryName,
        subCategoryName,
        availableDays: formattedAvailableDays,
        timeSlots: formattedTimeSlots,
    };
    const skip = (page - 1) * limit;
    const serviceQuery = yield service_model_1.default.find({
        categoryName: formattedQuery.categoryName,
        subCategoryName: formattedQuery.subCategoryName,
    })
        .select('businessId')
        .populate('businessId');
    console.log('serviceQuery===', serviceQuery);
    const uniqueServiceQuery = serviceQuery.filter((value, index, self) => {
        return (self.findIndex((item) => item.businessId._id.toString() === value.businessId._id.toString()) === index);
    });
    console.log('Unique Service Query:', uniqueServiceQuery);
    const activeSubscriptions = yield purchestSubscription_model_1.default.find({
        endDate: { $gte: new Date() },
        // startDate: { $lte: new Date() },
    }).select('businessUserId');
    // console.log('activeSubscriptions', activeSubscriptions);
    const activeBusinessIds = activeSubscriptions.map((sub) => sub.businessUserId.toString());
    // console.log('activeBusinessIds', activeBusinessIds);
    const businessesWithinRadius = yield business_model_1.default.find({
        _id: {
            $in: uniqueServiceQuery === null || uniqueServiceQuery === void 0 ? void 0 : uniqueServiceQuery.map((service) => { var _a; return (_a = service === null || service === void 0 ? void 0 : service.businessId) === null || _a === void 0 ? void 0 : _a._id; }),
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
    const subscriptionActiveBusiness = businessesWithinRadius.filter((business) => activeBusinessIds.includes(business.businessId.toString()));
    // console.log('subscriptionActiveBusiness', subscriptionActiveBusiness);
    let filteredBusinesses = [];
    if (formattedQuery.availableDays) {
        filteredBusinesses = subscriptionActiveBusiness.filter((businessId) => {
            if (!businessId.specifigDate || !businessId.availableDaysTime)
                return false;
            return formattedQuery.availableDays.some((day) => businessId.specifigDate.includes((0, business_utils_1.getDayDate)(day)) ||
                businessId.availableDaysTime.some((item) => item.day === day));
        });
    }
    // console.log('filteredBusinesses', filteredBusinesses);
    let newTimeSlots;
    if (formattedQuery.timeSlots) {
        newTimeSlots = yield (0, business_utils_1.generateNewTimeSlot)(formattedQuery.timeSlots);
    }
    let filteredResult = [];
    if (newTimeSlots && typeof newTimeSlots === 'string') {
        const [queryStartTime, queryEndTime] = newTimeSlots.split(' - ');
        const queryStart = convertTo24HourFormat11(queryStartTime.trim());
        const queryEnd = convertTo24HourFormat11(queryEndTime.trim());
        filteredResult = filteredBusinesses.filter((business) => {
            var _a, _b, _c;
            let startTime, endTime;
            let specifigstartTime, specifigendTime;
            if (((_a = business.specifigStartTime) === null || _a === void 0 ? void 0 : _a.trim()) &&
                ((_b = business.specifigEndTime) === null || _b === void 0 ? void 0 : _b.trim()) &&
                ((_c = business.specifigDate) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                specifigstartTime = convertTo24HourFormat11(business.specifigStartTime);
                specifigendTime = convertTo24HourFormat11(business.specifigEndTime);
            }
            if (formattedQuery.availableDays.length > 0) {
                const availableDaysTime = business.availableDaysTime;
                availableDaysTime.forEach((item) => {
                    if (formattedQuery.availableDays.includes(item.day)) {
                        startTime = convertTo24HourFormat11(item.startTime);
                        endTime = convertTo24HourFormat11(item.endTime);
                    }
                });
            }
            return ((specifigstartTime !== undefined &&
                specifigendTime !== undefined &&
                specifigstartTime >= queryStart &&
                specifigstartTime < queryEnd &&
                specifigendTime > queryStart) ||
                (startTime !== undefined &&
                    endTime !== undefined &&
                    startTime >= queryStart &&
                    startTime < queryEnd &&
                    endTime > queryStart));
        });
    }
    const favoriteData = yield favorite_model_1.default.find({ customerId });
    const enhancedResult = filteredResult.map((business) => {
        const isFavorite = favoriteData.some((fav) => fav.businessId.toString() === business._id.toString());
        return Object.assign(Object.assign({}, business._doc), { isFavorite });
    });
    console.log('enhancedResult', enhancedResult);
    const enhancedResult2 = yield Promise.all(enhancedResult.map((business) => __awaiter(void 0, void 0, void 0, function* () {
        const ugiTokenData = yield ugiToken_model_1.UgiToken.findOne({
            businessId: business.businessId,
            status: 'accept',
        });
        const ugiToken = ugiTokenData ? ugiTokenData.ugiTokenAmount : 'false';
        return Object.assign(Object.assign({}, business), { ugiToken });
    })));
    console.log('enhancedResult2', enhancedResult2);
    const sortedEnhancedResult2 = enhancedResult2.sort((a, b) => {
        if (b.ugiToken && !a.ugiToken)
            return 1;
        if (a.ugiToken && !b.ugiToken)
            return -1;
        return 0;
    });
    const total = sortedEnhancedResult2 === null || sortedEnhancedResult2 === void 0 ? void 0 : sortedEnhancedResult2.length;
    const totalPage = Math.ceil(total / limit);
    const paginatedResult = sortedEnhancedResult2.slice(skip, skip + limit);
    const meta = {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPage,
    };
    return { meta, result: paginatedResult };
});
const getAllFilterByBusinessByPostcodeService = (postCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiKey = config_1.default.googleApiKey;
        // console.log('api key', apiKey, postCode);
        if (!apiKey)
            throw new Error('Google API Key is missing!');
        // Geocoding API endpoint
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode},Bangladesh&key=${apiKey}`;
        // const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postCode}&key=${apiKey}`;
        // Fetching the geocoding data
        const response = yield axios_1.default.get(apiUrl);
        const data = response.data;
        if (data.status === 'OK') {
            const location = data.results[0].geometry.location;
            const latitude = location.lat;
            const longitude = location.lng;
            // Use the latitude and longitude as needed
            // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            const businessesAll = yield business_model_1.default.find({})
                .select('location.coordinates')
                .limit(1000);
            // console.log('business all', businessesAll);
            const businesses = yield business_model_1.default.find({
                location: {
                    $geoWithin: {
                        $centerSphere: [[longitude, latitude], 5 / 6378.1], // 20km radius
                        // $centerSphere: [[90.426659, 23.780546], 20 / 6378.1], // 20km radius
                    },
                },
            });
            // console.log('Nearby Businesses:', businesses);
            return businesses;
        }
        else {
            throw new Error('Geocoding API error: ' + data.status);
        }
    }
    catch (error) {
        console.error('Error fetching geocoding data:', error);
        throw error;
    }
});
const getSingleBusinessByBusinessIdService = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield business_model_1.default.findOne({ businessId }).populate('businessId');
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
        throw new AppError_1.default(404, 'Business not found!');
    }
    return result;
});
const getSingleBusinessService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield business_model_1.default.findById(id);
    // console.log({ result });
    if (!result) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    return result;
});
const getAppSingleBusinessService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield business_model_1.default.findById(id);
    // console.log({ result });
    if (!result) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    let availableDays = (_a = result.availableDaysTime) === null || _a === void 0 ? void 0 : _a.map((day) => day.day);
    // console.log({ availableDays });
    // result.availableDays = availableDaysTime;
    return Object.assign(Object.assign({}, result._doc), { availableDays });
});
// const getBusinessByServiceService = async (businessId: string) => {
//   const result = await Service.find({ businessId });
//   // console.log({ result });
//   if (!result) {
//     throw new AppError(404, 'Business not found!');
//   }
//   return result;
// };
const getBusinessByServiceService = (query, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({ businessId });
    const businessQuery = new QueryBuilder_1.default(service_model_1.default.find({ businessId }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield businessQuery.modelQuery;
    const meta = yield businessQuery.countTotal();
    return { meta, result };
});
const updateBusinessService = (businessId, files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('id', businessId);
    // console.log('payload', payload);
    // Check if the document exists
    console.log('payload==', payload);
    if (payload.businessType && typeof payload.businessType === 'string') {
        payload.businessType = JSON.parse(payload.businessType);
    }
    console.log('payload==2', payload);
    const existingBusiness = yield business_model_1.default.findOne({ businessId });
    if (!existingBusiness) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    // Validate files and process image
    if (files && files['businessImage'] && files['businessImage'][0]) {
        const BusinessImage = files['businessImage'][0];
        payload.businessImage = BusinessImage.path.replace(/^public[\\/]/, '');
    }
    const result = yield business_model_1.default.findOneAndUpdate({ businessId }, payload, {
        new: true,
    });
    if (result) {
        const imagePath = `public/${existingBusiness.businessImage}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath); // Check if the file exists
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    // console.log({ result });
    return result;
});
const updateAvailableBusinessTimeService = (businessId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBusiness = yield business_model_1.default.findOne({ businessId });
    if (!existingBusiness) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    const result = yield business_model_1.default.findOneAndUpdate({ businessId }, payload, {
        new: true,
    });
    return result;
});
const deletedBusinessService = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBusiness = yield business_model_1.default.findOne({ businessId });
    if (!existingBusiness) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    const result = yield business_model_1.default.findOneAndDelete({ businessId });
    if (result) {
        const imagePath = `public/${existingBusiness.businessImage}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath); // Check if the file exists
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    return result;
});
exports.businessService = {
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
