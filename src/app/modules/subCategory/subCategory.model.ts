import mongoose from "mongoose";
import { TSubCategory } from "./subCategory.interface";

const SubCategorySchema = new mongoose.Schema(
  {
    subCategoryname: {
      type: String,
      required: true,
    //   trim: true, // Remove extra spaces
    },
    categoryName: {
      type: String,
      required: true,
    //   trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to Category model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  },
);

const SubCategory = mongoose.model<TSubCategory>(
  'SubCategory',
  SubCategorySchema,
);

export default SubCategory;
