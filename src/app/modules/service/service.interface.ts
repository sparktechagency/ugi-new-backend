import { Types } from "mongoose"

export type TService = {
  businessUserId: Types.ObjectId;
  businessId: Types.ObjectId;
  categoryId: Types.ObjectId;
  subCategoryId: Types.ObjectId;
  categoryName: string;
  subCategoryName: string;
  serviceName: string;
  serviceDescription: string;
  serviceImage: string;
  servicePrice: number;
  businessDuration: string;
  dipositAmount: string;
};

