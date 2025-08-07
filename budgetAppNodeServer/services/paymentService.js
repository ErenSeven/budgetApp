import Payment from '../models/Payment.js';

export const createPayment = async (paymentData) => {
  const newPayment = new Payment(paymentData);
  return await newPayment.save();
};

export const getAllPayments = async () => {
  return await Payment.find({});
};

export const getPaymentById = async (id) => {
  return await Payment.findById(id);
};

export const getPaymentsByUserId = async (userId) => {
  return await Payment.find({ userID: userId });
};

export const updatePayment = async (id, updateData) => {
  return await Payment.findByIdAndUpdate(id, updateData, { new: true });
};

export const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};
