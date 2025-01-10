import { Types } from 'mongoose';

export type TSubCategory = {
  subCategoryname: string;
  categoryName: string;
  categoryId: Types.ObjectId;
};
