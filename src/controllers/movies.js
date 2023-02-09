const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const { incorrectData, filmNotFound, someoneElseMovie } = require('../utils/constants');

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(incorrectData));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;
  Movie.findById(movieId).orFail(new NotFoundError(filmNotFound))
    .then((movie) => {
      const ownerId = movie.owner;
      if (ownerId.toString() === _id.toString()) {
        return movie.remove()
          .then(() => {
            res.send(movie);
          });
      }
      return next(new ForbiddenError(someoneElseMovie));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(incorrectData));
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
