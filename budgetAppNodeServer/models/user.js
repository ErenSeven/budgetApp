import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - hashedPassword
 *       properties:
 *         _id:
 *           type: string
 *           description: Kullanıcı ID'si
 *         email:
 *           type: string
 *           format: email
 *           description: Kullanıcının email adresi
 *         hashedPassword:
 *           type: string
 *           description: Hashlenmiş parola
 *         paymentLimit:
 *           type: number
 *           description: Kullanıcının ödeme limiti (varsayılan 0)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Kaydın oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Kaydın son güncellenme tarihi
 *       example:
 *         _id: 64f1bfb03b5f3b74a71d1a21
 *         email: user@example.com
 *         hashedPassword: $2b$10$abcdefghijklmnopqrstuvxyz1234567890
 *         paymentLimit: 1000
 *         createdAt: 2023-09-01T12:34:56.789Z
 *         updatedAt: 2023-09-01T12:34:56.789Z
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    paymentLimit: {
        type: Number,
        default: 0,
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

const User = mongoose.model('User', userSchema);
export default User;