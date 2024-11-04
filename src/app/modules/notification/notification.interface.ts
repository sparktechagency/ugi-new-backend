import { Types } from "mongoose";

export type TNotification = {
  userId: Types.ObjectId; 
  message: string; 
  type?: 'info' | 'warning' | 'error' | 'success'; 
  isRead: boolean;  
};
