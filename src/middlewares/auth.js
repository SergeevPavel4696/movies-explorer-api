const jwt = require('jsonwebtoken');
const UnAuthorizedError = require('../errors/UnAuthorizedError');
const getSecretKey = require('../utils/secretKey');

const auth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new UnAuthorizedError('Необходима авторизация');
  }
  let payload;
  try {
    const key = getSecretKey();
    payload = jwt.verify(token, key);
  } catch (err) {
    next(new UnAuthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  next();
};

module.exports = auth;
