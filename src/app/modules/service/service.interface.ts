import { Types } from "mongoose"

export type TService={
     businessId: Types.ObjectId;
     serviceName: string;
     serviceDescription: string;
     serviceImage: string;
     servicePrice: number; 
}