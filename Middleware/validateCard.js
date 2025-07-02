const { verifyCardPin } = require('../Helpers/cardHelper');

module.exports = async (req, res, next) => {
  try {
    const { cardId, cardPin } = req.body;
    await verifyCardPin({ cardId, inputPin: cardPin });
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};
