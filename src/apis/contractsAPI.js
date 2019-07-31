const express = require('express');
const passport = require("../passport.js");

const {insertRecord, getRecords, updateRecord, deleteRecord} = require('../database/contracts');

const router = express.Router();

// endpoint to return all contract
router.get('/', passport.authenticate('local'), async (req, res) => {
  console.log('user', req.user);
  if (!req.user) {
    return res.status(401).send({});
  }

  var neededPermissions = req.user.permissions.filter((perm) => {
    return ['admin', 'contract_viewer', 'contract_editor'].indexOf(perm) > -1;
  });

  if (neededPermissions.length == 0) {
    return res.status(403).send({});
  }

  res.send(await getRecords(req.query));
});

// endpoint to insert new contract
router.post('/', passport.authenticate('local'), async (req, res) => {
  console.log('user', req.user);
  if (!req.user) {
    return res.status(401).send({});
  }

  var neededPermissions = req.user.permissions.filter((perm) => {
    return ['admin', 'contract_editor'].indexOf(perm) > -1;
  });

  if (neededPermissions.length == 0) {
    return res.status(403).send({});
  }

  const newRecord = req.body;
  const result = await insertRecord(newRecord);

  if (result.error) {
    res.status(422).send({ status: 'failure', error: result.error });
  } else {
    res.status(201).send({ status: 'success', result: {...result} });
  }
});

// endpoint to delete a contract
router.delete('/:id', passport.authenticate('local'), async (req, res) => {
  console.log('user', req.user);
  if (!req.user) {
    return res.status(401).send({});
  }

  var neededPermissions = req.user.permissions.filter((perm) => {
    return ['admin', 'contract_editor'].indexOf(perm) > -1;
  });

  if (neededPermissions.length == 0) {
    return res.status(403).send({});
  }

  const result = await deleteRecord(req.params.id);

  if (result.error) {
    res.status(400).send({ status: 'failure', error: result.error });
  } else {
    res.status(200).send({ status: 'success' });
  }
});

// endpoint to update a contract
router.put('/:id', passport.authenticate('local'), async (req, res) => {
  console.log('user', req.user);
  if (!req.user) {
    return res.status(401).send({});
  }

  var neededPermissions = req.user.permissions.filter((perm) => {
    return ['admin', 'contract_editor'].indexOf(perm) > -1;
  });

  if (neededPermissions.length == 0) {
    return res.status(403).send({});
  }

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
