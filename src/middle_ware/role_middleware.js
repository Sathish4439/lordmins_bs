const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔐 Checking role for user:', req.user?.role);

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('✅ Access granted');
    next();
  };
};

module.exports = { checkRole };
