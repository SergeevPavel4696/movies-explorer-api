const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errors = require('celebrate');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const getDBAdress = require('./src/utils/mongoDB');

const errorHandler = require('./src/middlewares/errorHandler');
/* const cors = require('./src/middlewares/cors'); */
const { requestLogger, errorLogger } = require('./src/middlewares/logger');
const router = require('./src/routes/ruoter');
const rateLimiter = require('./src/middlewares/rateLimiter');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
/* app.use(cors); */
mongoose.connect(getDBAdress(), {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(helmet());
app.use(rateLimiter);
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT);
