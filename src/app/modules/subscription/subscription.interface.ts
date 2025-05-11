
export type TFetureList = {
    feature: string
};


export type TSubscription = {
  type: 'Monthly' | 'Yearly';
  price: number;
  duration: number;
  fetureList: TFetureList[];
  isActive: boolean;
};
