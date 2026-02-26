const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔐 [auth] Route:', req.method, req.originalUrl);
    console.log('🔐 [auth] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : '❌ MISSING');
    console.log('🔐 [auth] JWT_SECRET loaded?', process.env.JWT_SECRET ? '✅ Yes' : '❌ No');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [auth] No Bearer token in header');
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ [auth] Token valid. userId:', decoded.userId);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('❌ [auth] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = authMiddleware;
