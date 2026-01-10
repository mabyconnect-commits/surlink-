const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
exports.generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token (using user.id for Supabase, not user._id for MongoDB)
  const token = this.generateToken(user.id);
  const refreshToken = this.generateRefreshToken(user.id);

  // Remove password from output
  user.password = undefined;
  user.password_hash = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    user
  });
};
