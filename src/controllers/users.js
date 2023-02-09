const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnAuthorizedError = require('../errors/UnAuthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const AlreadyExistsError = require('../errors/AlreadyExistsError');
const getSecretKey = require('../utils/secretKey');
const {
  duplicateUser, incorrectData, userNotFound, IDontExist, incorrectEmailOrPassword, goodbye,
} = require('../utils/constants');

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({ email, password: hash, name })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new AlreadyExistsError(duplicateUser));
          } else if (err.name === 'ValidationError') {
            next(new BadRequestError(incorrectData));
          } else {
            next(err);
          }
        });
    });
};

const updateUser = (req, res, next) => {
  const {
    email, name,
  } = req.body;
  const {
    _id,
  } = req.user;
  User.findByIdAndUpdate(_id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(userNotFound);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(incorrectData));
      } else {
        next(err);
      }
    });
};

const getUser = (req, res, next) => {
  const {
    userId,
  } = req.params;
  User.findById(userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(userNotFound);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(incorrectData));
      } else {
        next(err);
      }
    });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getMe = (req, res, next) => {
  const {
    _id,
  } = req.user;
  User.findById(_id)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(IDontExist);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (user) {
        const {
          _id,
        } = user;
        bcrypt.compare(password, user.password)
          .then((matched) => {
            if (matched) {
              const key = getSecretKey();
              const token = jwt.sign({ _id }, key, { expiresIn: '7d' });
              res.cookie('token', token, {
                maxAge: 1000 * 3600 * 24, httpOnly: true, sameSite: 'None', secure: true,
              });
              res.send({ token });
            } else {
              throw new UnAuthorizedError(incorrectEmailOrPassword);
            }
          });
      } else {
        throw new UnAuthorizedError(incorrectEmailOrPassword);
      }
    })
    .catch(next);
};

const out = (req, res) => {
  res.clearCookie('token').send({ message: goodbye });
};

module.exports = {
  createUser, updateUser, getUser, getUsers, getMe, login, out,
};
