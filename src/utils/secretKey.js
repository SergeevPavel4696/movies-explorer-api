require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

function getSecretKey() {
  return NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';
}

module.exports = getSecretKey;
