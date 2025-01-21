
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TCategory } from './category.interface';
import { Category } from './category.model';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
const createCategoryService = async (files: any, payload: TCategory) => {
    if(files && files['image'] && files['image'][0]) {
      payload['image'] = files['image'][0].path.replace(/^public[\\/]/, '');
    }
  const result = await Category.create(payload);
  
    if (!result) {
      const imagePath = `public/${payload.image}`;
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



// const getAllCategoryService = async (query: Record<string, unknown>) => {
//   const ServiceBookingQuery = new QueryBuilder(Category.find({}), query)
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await ServiceBookingQuery.modelQuery;
//   const meta = await ServiceBookingQuery.countTotal();
//   return { meta, result };
// };



const getAllCategoryService = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  const categoryQuery = await Category.aggregate([
    // Step 1: Join with the Business collection
    {
      $lookup: {
        from: 'businesses',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'businesses',
      },
    },
    // Step 2: Join with the Service collection
    {
      $lookup: {
        from: 'services',
        localField: 'businesses._id', // Match Business _id
        foreignField: 'businessId', // With Service's businessId
        as: 'services',
      },
    },
    // Step 3: Calculate the lowest service price
    {
      $addFields: {
        addPrice: {
          $cond: {
            if: { $gt: [{ $size: '$services' }, 0] }, // If there are services
            then: { $min: '$services.servicePrice' }, // Calculate minimum price
            else: 0, // Otherwise, set addPrice to 0
          },
        },
      },
    },
    // Step 4: Group by Category to consolidate duplicates
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image: { $first: '$image' },
        addPrice: { $first: '$addPrice' }, // Keep the calculated addPrice
      },
    },
    // Step 5: Project the final result
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        addPrice: 1,
      },
    },
    // Step 6: Pagination
    { $skip: skip }, // Skip the first (page-1) * limit documents
    { $limit: limit }, // Limit the result to `limit` documents
  ]);

  // Count total documents for meta data
  const totalDocuments = await Category.countDocuments({}); // Total categories in the collection

  // Calculate total pages
  const totalPage = Math.ceil(totalDocuments / limit);

  // Create meta information
  const meta = {
    page,
    limit,
    total: totalDocuments,
    totalPage,
  };

  console.log({ categoryQuery, meta });

  return { meta,  categoryQuery };
};









const getSingleCategoryService = async (id: string) => {
  const result = await Category.findById(id);
  return result;
};

const deletedCategoryService = async (id: string) => {
     const existingCategory = await Category.findById(id);
     if (!existingCategory) {
       throw new AppError(404, 'Category not found!');
     }
  const result = await Category.findByIdAndDelete(id);
  if (result) {
    const imagePath = `public/${existingCategory.image}`;
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

const updateCategoryService = async (id: string, files: any, payload: TCategory) => {
  console.log('id', id);
  console.log('payload', { payload });
  // Check if the document exists
  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    throw new AppError(404, 'Category not found!');
  }

  // Validate files and process image
  if (files && files['image'] && files['image'][0]) {
    const categoryImage = files['image'][0];
    payload.image = categoryImage.path.replace(/^public[\\/]/, '');
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (result) {
    const imagePath = `public/${existingCategory.image}`;
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

export const categoryService = {
  createCategoryService,
  getAllCategoryService,
  getSingleCategoryService,
  deletedCategoryService,
  updateCategoryService,
};
