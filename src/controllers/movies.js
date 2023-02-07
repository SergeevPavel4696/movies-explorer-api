const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;
  Movie.findById(movieId).orFail(new NotFoundError('Фильм не найден.'))
    .then((movie) => {
      const ownerId = movie.owner;
      if (ownerId.toString() === _id.toString()) {
        return movie.remove()
          .then(() => {
            res.send(movie);
          });
      }
      return next(new ForbiddenError('Вы не можете удалить чужой фильм.'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

const getMyMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find(owner)
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

module.exports = {
  createMovie, deleteMovie, getMyMovies,
};
