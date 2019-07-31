// notice: this api left open to allow create and update users with ease

const express = require('express');

const {insertRecord, getRecords, updateRecord, deleteRecord} = require('../database/users');

const router = express.Router();

// endpoint to return all user
router.get('/', async (req, res) => {
  res.send(await getRecords(req.query));
});

// endpoint to insert new user
router.post('/', async (req, res) => {
  const newRecord = req.body;
  const result = await insertRecord(newRecord);

  if (result.error) {
    res.status(422).send({ status: 'failure', error: result.error });
  } else {
    res.status(201).send({ status: 'success', result: {...result} });
  }
});

// endpoint to delete a user
router.delete('/:id', async (req, res) => {
  const result = await deleteRecord(req.params.id);

  if (result.error) {
    res.status(400).send({ status: 'failure', error: result.error });
  } else {
    res.status(200).send({ status: 'success' });
  }
});

// endpoint to update a user
router.put('/:id', async (req, res) => {
  const updatedRecord = req.body;
  const result = await updateRecord(req.params.id, updatedRecord);

  if (!result) {
    res.status(404).send({ status: 'failure', error: 'Record not found' });
  } else if (result.error) {
    res.status(422).send({ status: 'failure', error: result.error });
  } else {
    res.status(200).send({ status: 'success', result: {...result} });
  }
});

module.exports = router;
