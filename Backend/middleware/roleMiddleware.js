const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 🔐 Ensure user exists (authMiddleware must run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No user data found",
        });
      }

      // 🔐 Role check
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied - ${req.user.role} role not permitted`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default roleMiddleware;