import axiosInstance from './axiosInstance';

export const fetchPaymentsByUser = async (userId: string) => {
  const res = await axiosInstance.get(`/payments/user/${userId}`);
  return res.data;
};

export const addPayment = async (paymentData: any) => {
  const res = await axiosInstance.post('/payments', paymentData);
  return res.data;
};

export const updatePayment = async (id: string, updateData: any) => {
  const res = await axiosInstance.put(`/payments/${id}`, updateData);
  return res.data;
};

export const deletePayment = async (id: string) => {
  const res = await axiosInstance.delete(`/payments/${id}`);
  return res.data;
};
