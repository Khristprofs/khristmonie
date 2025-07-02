module.exports = function generateCVV(cardType = 'Visa') {
  const length = cardType === 'American Express' ? 4 : 3;
  let cvv = '';
  for (let i = 0; i < length; i++) {
    cvv += Math.floor(Math.random() * 10);
  }
  return cvv;
};