import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import { TUgiToken } from './ugiToken.interface';
import { UgiToken } from './ugiToken.model';
import Service from '../service/service.model';
import Business from '../business/business.model';
import { User } from '../user/user.models';
import { generateUniqueToken } from './ugiToken.utils';
import Notification from '../notification/notification.model';
const createUgiTokenService = async (payload: TUgiToken, session: any) => {
    const business = await Business.findOne({businessId: payload.businessId}).session(session);
    if (!business) {
      throw new AppError(404, 'Business not found!');
    }
    const token = generateUniqueToken(15);
    if(token){
        payload.ugiToken = token;
    }


  const result = await UgiToken.create([payload], { session });
  return result;
};

const getSingleUgiTokenService = async (
  businessId: string,
) => {
  const result = await UgiToken.find({
    status:"accept",
    businessId
  });
  return result;
};



const updateUgiTokenAcceptCencelService = async (id: string, status: string) => {
  // Check if the document exists
  const existingUgiToken = await UgiToken.findById(id);
  if (!existingUgiToken) {
    throw new AppError(404, 'UgiToken not found!');
  }

  const notification = await Notification.findOne({
    isUgiToken: existingUgiToken._id,
  });
  if (!notification) {
    throw new AppError(404, 'Notification not found!');  
  }



let result
  if(status === 'accept'){
      existingUgiToken.status = 'accept';

      if (notification && notification._id) {
        await Notification.findByIdAndUpdate(
          notification._id,
          { status: 'accept' },
          { new: true },
        );
        console.log('Notification updated: cancel');
      }



    result =  await existingUgiToken.save();
  }else{

     if (notification && notification._id) {
       await Notification.findByIdAndUpdate(
         notification._id,
         { status: 'cancel' },
         { new: true },
       );
       console.log('Notification updated: cancel');
     }
    // console.log('deleted ugi token');
    // existingUgiToken.status = 'cencel';
    // result = await existingUgiToken.save();
     result = await UgiToken.findByIdAndDelete(id);
     
    console.log('ugi tofken deleted')

  }


  return result;
};

export const ugiTokenService = {
  createUgiTokenService,
  getSingleUgiTokenService,
  updateUgiTokenAcceptCencelService
};
