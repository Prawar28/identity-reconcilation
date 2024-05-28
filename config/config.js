module.exports = {
  "development": {
    "username": "postgres",
    "password": "password",
    "database": "identity",
    "host": "localhost",
    "port": 5436,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DATABASE,
    "port": process.env.DB_PORT,
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  }
}
