// NOTICE: most functionality can be wrapped to separate class to be base for db-resources

const {startDatabase, getDatabase} = require('./sqlite');

const tableName = 'contracts';
const fields = ['name', 'address', 'created_at'];

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

      resolve(getRecord(this.lastID));
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
        records.push(row);
      });

      resolve(records);
    });
  });
}

async function getRecord(id) {
  const database = await getDatabase();
  const query = `SELECT *
                 FROM ` + tableName + `
                 WHERE id = ?`;

  return await new Promise((resolve, reject) => {
    let records = [];

    database.get(query, [id], (err, row) => {
      if (err) {
        return resolve(err.message);
      }

      resolve(row);
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

      resolve(getRecord(id));
    });
  });
}

// clean record from wrong fields
function whiteListFields(record) {
  return ({name, address} = record, {name, address});
}

module.exports = {
  insertRecord,
  getRecords,
  deleteRecord,
  updateRecord,
};
