const sqlite3 = require('sqlite3');

let database = null;

async function startDatabase() {
  // by default: OPEN_READWRITE | OPEN_CREATE
  database = new sqlite3.Database('./src/database/node_app.db', (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log('Successfully connected to database.');
  });
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

async function closeDatabase(callback) {
  if (database) {
    return database.close(() => {
      database = null;
      if (callback) callback();
    });
  }

  if (callback) callback();
}

module.exports = {
  getDatabase,
  startDatabase,
  closeDatabase
};
