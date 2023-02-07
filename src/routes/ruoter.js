const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const movieRouter = require('./movies');
const userRouter = require('./users');

const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

const { login, createUser, out } = require('../controllers/users');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);
router.get('/signout', out);
router.use(auth);
router.use('/movies', movieRouter);
router.use('/users', userRouter);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Некорректный адрес запроса.'));
});

module.exports = router;
