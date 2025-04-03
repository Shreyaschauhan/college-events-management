// backend/middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers['authorization']; // Format: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1]; // Extract token part

  // 2. Check if token exists
  if (token == null) {
    // No token provided
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // 3. Verify the token
  jwt.verify(token, "default-secret-key", (err, userPayload) => {
    if (err) {
      // Handle different JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Forbidden: Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
      // Handle other potential errors during verification
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ message: 'Forbidden: Token verification failed' });
    }

    // 4. Token is valid, attach the payload to the request object
    // The 'userPayload' will contain whatever you put into it when signing
    // (e.g., { id: '...', email: '...', role: '...' })
    req.user = userPayload;

    // 5. Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateToken;