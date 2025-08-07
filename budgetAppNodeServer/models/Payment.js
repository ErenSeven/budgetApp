import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - userID
 *         - categoryID
 *         - paymentDate
 *         - paymentAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: Otomatik oluşturulan ödeme ID'si
 *         userID:
 *           type: string
 *           description: Ödemeyi yapan kullanıcı ID'si (User referansı)
 *         categoryID:
 *           type: string
 *           description: Ödeme kategorisi ID'si (Category referansı)
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Ödeme tarihi
 *         description:
 *           type: string
 *           description: Ödeme açıklaması (isteğe bağlı)
 *         paymentAmount:
 *           type: number
 *           description: Ödeme tutarı
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Kaydın oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Kaydın son güncellenme tarihi
 *       example:
 *         _id: 64f1c0a3b5f3b74a71d1a22
 *         userID: 64f1bfb03b5f3b74a71d1a21
 *         categoryID: 64f1bfb03b5f3b74a71d1a20
 *         paymentDate: 2023-09-01T12:34:56.789Z
 *         description: Market alışverişi
 *         paymentAmount: 150.75
 *         createdAt: 2023-09-01T12:34:56.789Z
 *         updatedAt: 2023-09-01T12:34:56.789Z
 */
const paymentSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  description: String,
  paymentAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
