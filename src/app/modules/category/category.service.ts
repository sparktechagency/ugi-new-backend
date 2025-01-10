
import { unlink } from 'fs';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TCategory } from './category.interface';
import { Category } from './category.model';
const createCategoryService = async (payload: TCategory) => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategoryService = async (
  query: Record<string, unknown>
) => {
  const ServiceBookingQuery = new QueryBuilder(
    Category.find({}),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ServiceBookingQuery.modelQuery;
  const meta = await ServiceBookingQuery.countTotal();
  return { meta, result };
};

const getSingleCategoryService = async (id: string) => {
  const result = await Category.findById(id);
  return result;
};

const deletedCategoryService = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  return result;
}

const updateCategoryService = async (id: string, payload: TCategory) => {
  console.log('id', id);
  console.log('payload', { payload });
  // Check if the document exists
  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    throw new AppError(404, 'Category not found!');
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
  });

//  if (result) {
//   unlink(`public/uploads/category/${existingCategory?.image}`);
//   }

  console.log({ result });
  return result;
};

export const categoryService = {
  createCategoryService,
  getAllCategoryService,
  getSingleCategoryService,
  deletedCategoryService,
  updateCategoryService
};
