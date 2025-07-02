// Helpers/verifyRole.js
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure roles exist on request
        if (!req.roles) {
            console.error('No roles found in request');
            return res.sendStatus(401); // Unauthorized
        }

        // Check if any of the user's roles matches allowed roles
        const hasPermission = req.roles.some(role => 
            allowedRoles.includes(role)
        );

        if (!hasPermission) {
            console.error(`User with roles [${req.roles}] not authorized for [${allowedRoles}]`);
            return res.sendStatus(403); // Forbidden
        }
        
        next();
    };
};

module.exports = verifyRoles;