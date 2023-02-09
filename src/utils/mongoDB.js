require('dotenv').config();

const { NODE_ENV, DB_ADRESS } = process.env;

function getDBAdress() {
  return NODE_ENV === 'production' ? DB_ADRESS : 'mongodb://localhost:27017/filmsdb';
}

module.exports = getDBAdress;
