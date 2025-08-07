import express from 'express';
import { registerUser, loginUser, jwtAuthenticateUser, refreshTokenHandler, logoutUser, updatePaymentLimitController } from '../controllers/userController.js';
import { verifyAccessTokenMiddleware, verifyRefreshTokenMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * /api/users/:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Register is success
 *       400:
 *         description: Email and Password are required
 *       409:
 *         description: This email is already registered
 *       500:
 *         description: Database error
 */
router.post('/', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login to obtain access and refresh tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Email and Password are required
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/authenticate:
 *   get:
 *     summary: Verify access token and get authenticated user info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []   # Bearer token gerektiriyor
 *     responses:
 *       200:
 *         description: Authenticated user information returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60b6c0f8c1a4f91234d56789
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
router.get('/authenticate', verifyAccessTokenMiddleware, jwtAuthenticateUser)

/**
 * @swagger
 * /api/users/token/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Yeni access token başarıyla döndü
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token bulunamadı
 *       403:
 *         description: Geçersiz veya süresi dolmuş refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Geçersiz veya süresi dolmuş refresh token
 */
router.post('/token/refresh',verifyRefreshTokenMiddleware , refreshTokenHandler);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user and clear refresh token cookie
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful and refresh token cookie cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       500:
 *         description: Logout failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout failed
 *                 error:
 *                   type: string
 *                   example: Error message here
 */
router.post('/logout', logoutUser);


/**
 * @swagger
 * /api/users/{id}/paymentLimit:
 *   put:
 *     summary: Kullanıcının harcama limitini güncelle
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Güncellenecek kullanıcının ID'si
 *     requestBody:
 *       description: Güncellenecek harcama limiti
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentLimit
 *             properties:
 *               paymentLimit:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Harcama limiti başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Harcama limiti başarıyla güncellendi
 *                 user:
 *                   type: object
 *                   description: Güncellenmiş kullanıcı bilgisi
 *       400:
 *         description: Geçersiz istek (örneğin paymentLimit eksik veya yanlış formatta)
 *       401:
 *         description: Yetkisiz - token eksik veya geçersiz
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id/paymentLimit', updatePaymentLimitController);

export default router;
