import jwt from 'jsonwebtoken';

const generateAccessToken = (user) => {
  try {
    return jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  } catch (error) {
    console.error('Access token oluşturma hatası:', error);
    throw error;
  }
};


const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email,},
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
