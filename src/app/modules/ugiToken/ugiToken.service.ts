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
  const result = await UgiToken.findOne({
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
let result
  if(status === 'accept'){
      existingUgiToken.status = 'accept';
    result =  await existingUgiToken.save();
  }else{
     result = await UgiToken.findByIdAndDelete( id);

  }


  return result;
};

export const ugiTokenService = {
  createUgiTokenService,
  getSingleUgiTokenService,
  updateUgiTokenAcceptCencelService
};
