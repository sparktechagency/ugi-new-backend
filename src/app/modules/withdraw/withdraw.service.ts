import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import QueryBuilder from '../../builder/QueryBuilder';
import { TWithdraw } from './withdraw.interface';
import { Withdraw } from './withdraw.model';
import { Wallet } from '../wallet/wallet.model';

const addWithdrawService = async (payload: TWithdraw) => {
  const {
    mentorId,
    amount,
    method,
    bankDetails,
    paypalPayDetails,
    applePayDetails,
  } = payload;

  const mentor = await User.findById(mentorId);
  if (!mentor) {
    throw new AppError(400, 'Mentor is not found!');
  }

  if (mentor.role !== 'mentor') {
    throw new AppError(400, 'User is not authorized as a Mentor!!');
  }

  // Validate Withdrawal Amount
  if (!amount || amount <= 0) {
    throw new AppError(
      400,
      'Invalid Withdrawal amount. It must be a positive number.',
    );
  }

  // Validate Withdrawal Method
  const validMethods = ['bank', 'paypal_pay', 'apple_pay'];
  if (!method || !validMethods.includes(method)) {
    throw new AppError(400, 'Invalid Withdrawal method.');
  }

  // Method-specific validation
  if (method === 'bank') {
    if (
      !bankDetails ||
      !bankDetails.accountNumber ||
      !bankDetails.accountName ||
      !bankDetails.bankName
    ) {
      throw new AppError(
        400,
        'All bank details (account number, account name, bank name) are required for bank Withdrawals.',
      );
    }
  } else if (method === 'paypal_pay') {
    if (!paypalPayDetails || !paypalPayDetails.paypalId) {
      throw new AppError(
        400,
        'Google Pay token is required for Google Pay Withdrawals.',
      );
    }
  } else if (method === 'apple_pay') {
    if (!applePayDetails || !applePayDetails.appleId) {
      throw new AppError(
        400,
        'Apple Pay token is required for Apple Pay Withdrawals.',
      );
    }
  }

  const result = await Withdraw.create(payload);

  return result;
};

const getAllWithdrawService = async (query: Record<string, unknown>) => {
  const WithdrawQuery = new QueryBuilder(
    Withdraw.find()
      .populate('mentorId'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await WithdrawQuery.modelQuery;
  const meta = await WithdrawQuery.countTotal();
  return { meta, result };
};
const getAllWithdrawByMentorService = async (
  query: Record<string, unknown>,
  mentorId: string,
) => {
  const WithdrawQuery = new QueryBuilder(Withdraw.find({ mentorId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await WithdrawQuery.modelQuery;
  const meta = await WithdrawQuery.countTotal();
  return { meta, result };
};

const singleWithdrawService = async (id: string) => {
  const task = await Withdraw.findById(id);
  return task;
};

const acceptSingleWithdrawService = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Withdraw ID is required');
  }

  // Fetch the withdrawal request
  const withdraw = await Withdraw.findById(id);
  if (!withdraw) {
    throw new AppError(404, 'Withdraw not found');
  }

  // Fetch the mentor's wallet
  const wallet = await Wallet.findOne({ mentorId: withdraw.mentorId });
  if (!wallet) {
    throw new AppError(404, 'Wallet not found for the mentor');
  }

  // Ensure wallet has sufficient funds
  if (wallet.amount < withdraw.amount) {
    throw new AppError(400, 'Insufficient funds in the wallet');
  }

  // Update the withdrawal status to 'paid'
  const updatedWithdraw = await Withdraw.findByIdAndUpdate(
    id,
    { status: 'paid' },
    { new: true },
  );

  // Deduct the amount from the wallet asynchronously
  process.nextTick(async () => {
    try {
      await Wallet.findOneAndUpdate(
        { mentorId: withdraw.mentorId },
        { $inc: { amount: -withdraw.amount } },
        { new: true },
      );
    } catch (error) {
      console.error('Error updating wallet balance:', error);
    }
  });

  return updatedWithdraw;
};


const deleteSingleWithdrawService = async (id: string) => {
  const result = await Withdraw.deleteOne({ _id: id });
  return result;
};

export const withdrawService = {
  addWithdrawService,
  getAllWithdrawService,
  singleWithdrawService,
  getAllWithdrawByMentorService,
  acceptSingleWithdrawService,
  deleteSingleWithdrawService,

};
