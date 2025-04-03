// backend/middleware/isAdmin.js

/**
 * Middleware to check if the authenticated user has the 'admin' role.
 * Assumes that a preceding authentication middleware (e.g., JWT verification)
 * has successfully run and attached the decoded token payload to `req.user`,
 * and that this payload includes a `role` property.
 */
const isAdmin = (req, res, next) => {
    // 1. Check if req.user exists (populated by the authentication middleware)
    if (!req.user) {
      // This scenario implies the authentication middleware should have already rejected
      // the request, but we add a safeguard.
      console.warn('isAdmin middleware reached without req.user being set. Check middleware order.');
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    // 2. Check if the role property exists on req.user
    if (!req.user.role) {
      console.error('User role not found in req.user. Ensure the JWT payload includes the "role" claim and the auth middleware attaches it.');
      // Sending 403 because the user is authenticated but lacks the necessary claim for authorization here.
      // A 500 might also be justifiable if this is considered a server configuration error.
      return res.status(403).json({ message: 'Forbidden: User role information missing.' });
    }
  
    // 3. Check if the user's role is 'admin'
    if (req.user.role === 'admin') {
      // User has the admin role, allow access to the next middleware or route handler
      next();
    } else {
      // User is authenticated but does not have admin privileges
      return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    }
  };
  
  module.exports = isAdmin;