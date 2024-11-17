import { model, Schema } from 'mongoose';
import { TWithdraw } from './withdraw.interface';

const WithdrawSchema = new Schema<TWithdraw>(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['bank', 'paypal_pay', 'apple_pay'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },

    bankDetails: {
      accountNumber: { type: String },
      accountName: { type: String },
      bankName: { type: String },
    },
    paypalPayDetails: {
      paypalId: { type: String },
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

WithdrawSchema.pre('validate', function (next) {
  if (this.method === 'bank') {
    if (
      !this.bankDetails ||
      !this.bankDetails.accountNumber ||
      !this.bankDetails.accountName ||
      !this.bankDetails.bankName
    ) {
      return next(new Error('Bank details are required for bank withdrawals.'));
    }
  } else if (this.method === 'paypal_pay') {
    if (!this.paypalPayDetails || !this.paypalPayDetails.paypalId) {
      return next(
        new Error('GooglePay details are required for Google withdrawals.'),
      );
    }
  } else if (this.method === 'apple_pay') {
    if (!this.applePayDetails || !this.applePayDetails.appleId) {
      return next(
        new Error('ApplePay details are required for Apple withdrawals.'),
      );
    }
  }
  next();
});

export const Withdraw = model<TWithdraw>('Withdraw', WithdrawSchema);
