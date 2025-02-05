import mongoose from "mongoose";
import { TSubCategory } from "./subCategory.interface";

const SubCategorySchema = new mongoose.Schema(
  {
    subCategoryname: {
      type: String,
      required: true,
    
    },
    categoryName: {
      type: String,
      required: true,
    
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', 
      required: true,
    },
  },
  {
    timestamps: true, 
  },
);

const SubCategory = mongoose.model<TSubCategory>(
  'SubCategory',
  SubCategorySchema,
);

export default SubCategory;
