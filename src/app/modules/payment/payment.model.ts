import { model, Schema } from 'mongoose';
import { TPayment } from './payment.interface';


const paymentSchema = new Schema<TPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceBooking',
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Buisness',
      required: true,
    },
    bookingprice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    dipositParsentage: { type: Number, required: true },
    method: {
      type: String,
      enum: ['bank', 'google_pay', 'apple_pay'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },

    // bankDetails: {
    //   accountNumber: { type: String },
    //   accountName: { type: String },
    //   bankName: { type: String },
    // },
    googlePayDetails: {
      googleId: { type: String },
    },
    applePayDetails: {
      appleId: { type: String },
    },
    transactionId: {
      type: String,
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);


paymentSchema.pre('validate', function (next) {
    if (this.method === 'google_pay') {
      if (!this.googlePayDetails || !this.googlePayDetails.googleId) {
        return next(
          new Error('GooglePay details are required !'),
        );
      }
    } else if (this.method === 'apple_pay') {
      if (!this.applePayDetails || !this.applePayDetails.appleId) {
        return next(
          new Error('ApplePay details are required for !'),
        );
      }
    }
  next();
});


// paymentSchema.pre('validate', function (next) {
//   if (this.method === 'bank') {
//     if (
//       !this.bankDetails ||
//       !this.bankDetails.accountNumber ||
//       !this.bankDetails.accountName ||
//       !this.bankDetails.bankName
//     ) {
//       return next(new Error('Bank details are required for bank withdrawals.'));
//     }
//   } else if (this.method === 'paypal_pay') {
//     if (!this.paypalPayDetails || !this.paypalPayDetails.paypalId) {
//       return next(
//         new Error('GooglePay details are required for Google withdrawals.'),
//       );
//     }
//   } else if (this.method === 'apple_pay') {
//     if (!this.applePayDetails || !this.applePayDetails.appleId) {
//       return next(
//         new Error('ApplePay details are required for Apple withdrawals.'),
//       );
//     }
//   }
//   next();
// });

export const Payment = model<TPayment>('Payment', paymentSchema);
