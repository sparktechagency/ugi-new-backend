import { Model, ObjectId, Types } from 'mongoose';

interface IAddress {
  house: string;
  area: string;
  city: string;
  state: string;
  country: string;
}

export interface TUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface TUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  password: string;
  role: string;
  phoneNumber: string;
  gender?: string;
  dob?: string;
  shopId?: string;
  address?: IAddress;

  accountStatus: 'active' | 'blocked';
  needsPasswordChange?: boolean;
  passwordChangedAt?: Date;
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  IsUserExistId(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
