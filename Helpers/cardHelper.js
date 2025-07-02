const { Card } = require('../models');
const bcrypt = require('bcrypt');

exports.verifyCardPin = async ({ cardId, inputPin }) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found');

  const isMatch = await bcrypt.compare(inputPin, card.pin);
  if (!isMatch) throw new Error('Invalid card PIN');

  return card;
};