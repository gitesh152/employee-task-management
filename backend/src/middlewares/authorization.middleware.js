/**
 * Authorize user based on role(s).
 * Must be used after authentication middleware.
 */

const authorize = (...allowedRoles) => {
  /** Restrict access to endpoints based on the authenticated user's role */
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized!',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

export default authorize;
