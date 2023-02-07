const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnAuthorizedError = require('../errors/UnAuthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const AlreadyExistsError = require('../errors/AlreadyExistsError');
const getSecretKey = require('../utils/secretKey');

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({ name, email, password: hash })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new AlreadyExistsError('Пользователь с указанным email уже существует.'));
          } else if (err.name === 'ValidationError') {
            next(new BadRequestError('Переданы некорректные данные.'));
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
        throw new NotFoundError('Пользователь не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные.'));
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
        throw new NotFoundError('Пользователь не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
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
        throw new NotFoundError('Меня нет.');
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
              throw new UnAuthorizedError('Неправильные почта или пароль.');
            }
          });
      } else {
        throw new UnAuthorizedError('Неправильные почта или пароль.');
      }
    })
    .catch(next);
};

const out = (req, res) => {
  res.clearCookie('token').send({ message: 'До свидания.' });
};

module.exports = {
  createUser, updateUser, getUser, getUsers, getMe, login, out,
};
