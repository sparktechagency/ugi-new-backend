
export type TFetureList = {
    feature: string
};


export type TSubscription = {
  type: 'monthly' | 'yearly';
  price: number;
  duration: number;
  fetureList: TFetureList[];
  isActive: boolean;
  stripe_price_id: string;
  stripe_product_id: string;
};
