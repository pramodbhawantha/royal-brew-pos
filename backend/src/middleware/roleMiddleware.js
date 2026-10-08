const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check whether user is authenticated
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check user role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = authorizeRoles;