import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import { TService } from './service.interface';
import Service from './service.model';
import { Category } from '../category/category.model';
import SubCategory from '../subCategory/subCategory.model';
import { object } from 'zod';
import mongoose from 'mongoose';


const createBusinessServiceService = async (files: any, payload: TService) => {

  const category = await Category.findById(payload.categoryId);
  if (!category) {
    throw new AppError(400, 'Category not found');
  }
  
  const subCategory = await SubCategory.findById(payload.subCategoryId);
  if (!subCategory) {
    throw new AppError(400, 'Sub Category not found');
  }

  if (files && files['serviceImage'] && files['serviceImage'][0]) {
    payload['serviceImage'] = files['serviceImage'][0].path.replace(
      /^public[\\/]/,
      '',
    );
  }
  const result = await Service.create(payload);

  if (!result) {
    const imagePath = `public/${payload.serviceImage}`;
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

const getAllBusinessServiceByBusinessId = async (query: Record<string, unknown>, businessId: string) => {
  const businessServiceQuery = new QueryBuilder(
    Service.find({ businessUserId: businessId }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await businessServiceQuery.modelQuery;
  const meta = await businessServiceQuery.countTotal();
  return { meta, result };
};



const getAllAdminServiceByBusinessId = async (
  businessId: string,
) => {

  const businessIdx = new mongoose.Types.ObjectId(businessId);
  const service = await Service.find({ businessUserId: businessIdx });
  return service;
  
};

const getAllAdminByService = async (
  query: Record<string, unknown>,
) => {
  const businessServiceQuery = new QueryBuilder(
    Service.find({}).populate('businessUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await businessServiceQuery.modelQuery;
  const meta = await businessServiceQuery.countTotal();
  return { meta, result };
};

const getSingleBusinessServiceService = async (id: string) => {
  const result = await Service.findById(id);
  return result;
};

const updateBusinessServiceService = async (
  id: string,
  files: any,
  payload: TService,
) => {
  console.log('id', id);
  console.log('payload', { payload });
  // Check if the document exists
  const existingBusinessService = await Service.findById(id);
  if (!existingBusinessService) {
    throw new AppError(404, 'BusinessService not found!');
  }

  // Validate files and process image
  if (files && files['serviceImage'] && files['serviceImage'][0]) {
    const BusinessServiceImage = files['serviceImage'][0];
    payload.serviceImage = BusinessServiceImage.path.replace(
      /^public[\\/]/,
      '',
    );
  }

  const result = await Service.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (result) {
    const imagePath = `public/${existingBusinessService.serviceImage}`;
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


const deletedBusinessServiceService = async (id: string, businessId: string) => {
  const existingBusinessService = await Service.findById(id);
  if (!existingBusinessService) {
    throw new AppError(404, 'BusinessService not found!');
  }
  const business = await Service.findOne({
    businessUserId: businessId
  });

  if (!business) {
    throw new AppError(404, 'Business user not found!');
  }
  const result = await Service.findByIdAndDelete(id);
  if (result) {
    const imagePath = `public/${existingBusinessService.serviceImage}`;
    console.log('File path to delete:', imagePath);

    try {
      await access(imagePath);
      console.log('File exists, proceeding to delete:', imagePath);

      await unlink(imagePath);
      console.log('File successfully deleted:', imagePath);
    } catch (error: any) {
      console.error(`Error handling file at ${imagePath}:`, error.message);
    }
  }
  return result;
};




export const businessServiceService = {
  createBusinessServiceService,
  getAllBusinessServiceByBusinessId,
  getAllAdminServiceByBusinessId,
  getAllAdminByService,
  getSingleBusinessServiceService,
  deletedBusinessServiceService,
  updateBusinessServiceService,
};
