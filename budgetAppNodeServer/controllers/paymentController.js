import * as paymentService from '../services/paymentService.js';

export const createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    const payment = await paymentService.createPayment(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPayment = await paymentService.updatePayment(id, updateData);
    if (!updatedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await paymentService.deletePayment(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await paymentService.getPaymentsByUserId(userId);
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No payments found for this user' });
    }
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};