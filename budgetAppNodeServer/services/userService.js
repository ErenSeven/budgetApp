import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwtUtils from '../utils/jwt.js';

export const registerUser = async (email, hashedPassword) => {
    const newUser = new User({
        email,
        hashedPassword: hashedPassword,
    });

    return await newUser.save();
}

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const generateTokens = (user) => {
  const accessToken = jwtUtils.generateAccessToken(user);
  const refreshToken = jwtUtils.generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isMatch) throw new Error('Invalid password');

  return user;
};

export const updatePaymentLimit = async (userId, newLimit) => {
  return await User.findByIdAndUpdate(
    userId,
    { paymentLimit: newLimit },
    { new: true }
  );
};