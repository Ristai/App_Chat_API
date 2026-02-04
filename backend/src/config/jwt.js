export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
};

export default jwtConfig;
