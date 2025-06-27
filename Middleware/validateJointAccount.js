module.exports = (req, res, next) => {
  const { userId, accountId, role, relationship } = req.body;

  if (!userId || !accountId || !role || !relationship) {
    return res.status(400).json({
      message: 'userId, accountId, role, and relationship are required.'
    });
  }

  const validRoles = ['primary', 'co-owner', 'authorized_user', 'secondary', 'guardian'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      message: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  next();
};