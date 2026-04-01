const checkPendingDeletion = (req, res, next) => {
  try {
    const user = req.user;

    // If no user (should not happen, but safe check)
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // If NOT pending deletion → allow everything
    if (!user.pendingDeletion) {
      return next();
    }

    // Allowed routes (whitelist)
    const allowedRoutes = ["/cancel-deletion", "/logout", "/logout-all"];

    // Check current route
    const isAllowed = allowedRoutes.some((route) =>
      req.originalUrl.includes(route)
    );

    if (isAllowed) {
      return next();
    }

    //  Block everything else
    return res.status(403).json({
      message:
        "Your account is scheduled for deletion. Cancel deletion to regain access.",
      pendingDeletion: true,
    });
  } catch (error) {
    console.error("Pending Deletion Middleware Error:", error);

    return res.status(500).json({
      message: "Server error in deletion check middleware",
    });
  }
};

module.exports = checkPendingDeletion;