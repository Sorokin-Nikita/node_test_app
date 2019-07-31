// NOTICE: most functionality can be wrapped to separate class to be base for db-resources

const {startDatabase, getDatabase} = require('./sqlite');
const md5 = require('md5');

const tableName = 'users';
const fields = ['full_name', 'login', 'password', 'permissions'];

async function insertRecord(record) {
  const database = await getDatabase();
  record = whiteListFields(record);

  let columnNames = [],
      placeholders = [],
      values = [];

  fields.forEach((field) => {
    if (record[field]) {
      columnNames.push(field);
      values.push(record[field]);
      placeholders.push('?');
    }
  });

  const query = `INSERT INTO ` + tableName + `(` + columnNames.join(',') + `) VALUES(` + placeholders.join(',') + `)`;

  return await new Promise((resolve, reject) => {
    database.run(query, values, function (err) {
      if (err) {
        return resolve({error: err.message});
      }

      resolve(findUser(this.lastID));
    });
  });
}

async function getRecords(params) {
  const database = await getDatabase();

  const page = parseInt(params && params.page || 1);
  const limit = parseInt(params && params.per_page || 10);
  const offset = limit * (page - 1);
  const query = `SELECT *
                 FROM ` + tableName + `
                 ORDER BY id
                 LIMIT ?
                 OFFSET ?`;

  return await new Promise((resolve, reject) => {
    let records = [];

    database.all(query, [limit, offset], (err, rows) => {
      if (err) {
        return resolve(err.message);
      }

      rows.forEach((row) => {
        records.push(publicFields(row));
      });

      resolve(records);
    });
  });
}

async function findUser(id) {
  const database = await getDatabase();
  const query = `SELECT *
                 FROM ` + tableName + `
                 WHERE id = ?`;

  return await new Promise((resolve, reject) => {
    let records = [];

    database.get(query, [id], (err, row) => {
      if (err) {
        return resolve({ error: err.message });
      }

      resolve(publicFields(row));
    });
  });
}

async function findUserByLogin(login) {
  const database = await getDatabase();
  const query = `SELECT *
                 FROM ` + tableName + `
                 WHERE login = ?`;

  return await new Promise((resolve, reject) => {
    let records = [];

    database.get(query, [login], (err, row) => {
      if (err) {
        return resolve({error: err.message});
      }

      resolve(publicFields(row));
    });
  });
}

async function deleteRecord(id) {
  const database = await getDatabase();
  const query = `DELETE FROM ` + tableName + `
                 WHERE id = ?`;

  return await new Promise((resolve, reject) => {
    database.run(query, [id], (err) => {
      if (err) {
        return resolve({error: err.message});
      }

      resolve({});
    });
  });
}

async function updateRecord(id, record) {
  const database = await getDatabase();
  record = whiteListFields(record);

  let columnNames = [],
      values = [],
      objectFields = Object.keys(record);

  fields.forEach((field) => {
    if (objectFields.indexOf(field) > -1) {
      columnNames.push([field, '?'].join(' = '));
      values.push(record[field]);
    }
  });

  values.push(id);

  const query = `UPDATE ` + tableName + `
                 SET ` + columnNames.join(',') + `
                 WHERE id = ?`;

  return await new Promise((resolve, reject) => {
    database.run(query, values, function (err) {
      if (err) {
        return resolve({error: err.message});
      }

      resolve(findUser(id));
    });
  });
}

async function isValidPassword(login, password, done) {
  let result = await findUserByLogin(login);

  if (!result) {
    return done(null, false)
  }

  if (result.error) {
    return done(result.error)
  }

  if (md5(password) !== result.password ) {
    return done(null, false)
  }

  return done(null, result)
}

// clean record from wrong fields before saving to database
function whiteListFields(record) {
  var filteredRecord = ({full_name, login, permissions, password} = record, {full_name, login, permissions, password});

  if (filteredRecord.permissions && filteredRecord.permissions.join) {
    filteredRecord.permissions = filteredRecord.permissions.join(';');
  }

  if (filteredRecord.password) {
    filteredRecord.password = md5(filteredRecord.password);
  }

  fields.forEach((field) => {
    if (Object.keys(record).indexOf(field) < 0) delete filteredRecord[field];
  });

  return filteredRecord;
}

// prepare record for sending to client
function publicFields(record) {
  var filteredRecord = ({id, full_name, login, permissions} = record, {id, full_name, login, permissions});

  if (filteredRecord.permissions) {
    filteredRecord.permissions = filteredRecord.permissions.split(';');
  }

  return filteredRecord;
}

module.exports = {
  insertRecord,
  getRecords,
  deleteRecord,
  findUser,
  updateRecord,
  findUserByLogin,
  isValidPassword
};
