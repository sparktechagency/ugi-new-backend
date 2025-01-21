import { Schema, model, Types, Document } from 'mongoose';
import { TService } from './service.interface';



const ServiceSchema = new Schema<TService>(
  {
    businessUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    subCategoryName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceDescription: {
      type: String,
      required: true,
      trim: true,
    },
    serviceImage: {
      type: String,
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    businessDuration: {
      type: String,
      required: true,
    },
    dipositAmount: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

const Service = model<TService>('Service', ServiceSchema);

export default Service;
