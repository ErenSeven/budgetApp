import bcrypt from 'bcrypt';
import * as userService from '../services/userService.js';
import userModel from '../models/user.js';
import jwtUtils from '../utils/jwt.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userService.registerUser(email, hashedPassword);
    
    res.status(201).json({ message: 'Register is success'});
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const user = await userService.authenticateUser(email, password);

    const accessToken = jwtUtils.generateAccessToken(user);
    const refreshToken = jwtUtils.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: accessToken,
      user: user
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid email or password', error: error.message });
  }
};


export const jwtAuthenticateUser = async (req, res) => {
  try {
    const payload = req.user;
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await userService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user }); 
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

export const refreshTokenHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token bulunamadı' });
  }

  try {
    const payload = jwtUtils.verifyRefreshToken(refreshToken); 
    const newAccessToken = jwtUtils.generateAccessToken({
      _id: payload.id,
      email: payload.email,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş refresh token' });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

export const updatePaymentLimitController = async (req, res) => {
  const userId = req.params.id;
  const { paymentLimit } = req.body;

  if (typeof paymentLimit !== 'number' && typeof paymentLimit !== 'string') {
    return res.status(400).json({ message: 'paymentLimit sayısal olmalıdır' });
  }

  const newLimit = Number(paymentLimit);
  if (isNaN(newLimit)) {
    return res.status(400).json({ message: 'paymentLimit geçerli bir sayı olmalıdır' });
  }

  try {
    const updatedUser = await userService.updatePaymentLimit(userId, newLimit);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({
      message: 'Harcama limiti başarıyla güncellendi',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Harcama limiti güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};