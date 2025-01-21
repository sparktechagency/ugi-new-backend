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
const createUgiTokenService = async (payload: TUgiToken) => {
    const service = await Service.findById(payload.serviceId);
    if (!service) {
      throw new AppError(404, 'Service not found!');
    }
    const business = await Business.findById(payload.businessId);
    if (!business) {
      throw new AppError(404, 'Business not found!');
    }
    const customer = await User.findById(payload.customerId);
    if (!customer) {
      throw new AppError(404, 'Customer not found!');
    }

    const token = generateUniqueToken(15);
    if(token){
        payload.ugiToken = token;
    }


  const result = await UgiToken.create(payload);
  return result;
};

const getSingleUgiTokenService = async (
  customerId: string,
  serviceId: string,
  serviceBookingId:string,
) => {
  const result = await UgiToken.findOne({
    serviceId,
    customerId,
    serviceBookingId,
  });
  return result;
};

const verifySingleUgiTokenService = async (
  businessId: string,
  ugiToken: string,
) => {
    // console.log({ businessId, ugiToken });
  const result = await UgiToken.findOne({ businessId, ugiToken });
  if(!result){
      throw new AppError(404, 'UgiToken is invalid !');
  }
  return result;
};

const updateUgiTokenService = async (id: string) => {
  // Check if the document exists
  const existingUgiToken = await UgiToken.findById(id);
  if (!existingUgiToken) {
    throw new AppError(404, 'UgiToken not found!');
  }
  if (existingUgiToken.status === 'deactive') {
    throw new AppError(404, 'UgiToken is already deactivated!');
  }

  const result = await UgiToken.findByIdAndUpdate(
    id,
    { status: 'deactive' },
    {
      new: true,
    },
  );

  return result;
};

export const ugiTokenService = {
  createUgiTokenService,
  getSingleUgiTokenService,
  verifySingleUgiTokenService,
  updateUgiTokenService,
};
