import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TSubCategory } from './subCategory.interface';
import SubCategory from './subCategory.model';


const createSubCategoryService = async (payload: TSubCategory) => {
  const result = await SubCategory.create(payload);
  return result;
};

const getAllSubCategoryService = async (query: Record<string, unknown>) => {
  const subCategoryQuery = new QueryBuilder(SubCategory.find({}), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await subCategoryQuery.modelQuery;
  const meta = await subCategoryQuery.countTotal();
  return { meta, result };
};

const getSingleSubCategoryService = async (id: string) => {
  const result = await SubCategory.findById(id);
  return result;
};

const deletedSubCategoryService = async (id: string) => {
     const existingSubCategory = await SubCategory.findById(id);
     if (!existingSubCategory) {
       throw new AppError(404, 'Sub Category not found!');
     }
  const result = await SubCategory.findByIdAndDelete(id);
  return result;
};

const updateSubCategoryService = async (id: string, payload: TSubCategory) => {

  const existingSubCategory = await SubCategory.findById(id);
  if (!existingSubCategory) {
    throw new AppError(404, 'Sub Category not found!');
  }
  const result = await SubCategory.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

export const subCategoryService = {
  createSubCategoryService,
  getAllSubCategoryService,
  getSingleSubCategoryService,
  deletedSubCategoryService,
  updateSubCategoryService,
};
