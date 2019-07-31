// load environment variables
require('dotenv').config();

//importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const expressSession = require("express-session");

const passport = require("./passport.js");

const {startDatabase, closeDatabase} = require('./database/sqlite');
const contractsAPI = require('./apis/contractsAPI');
const usersAPI = require('./apis/usersAPI');

const app = express();

const session = {
  secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
  cookie: {},
  resave: false,
  saveUninitialized: false
};

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(expressSession(session));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.status(200).send({status: 'success'});
  }
);

app.get('/logout',
  function(req, res) {
    req.logout();
    res.send({ 'status': 'success' });
  }
);

app.use('/contracts', contractsAPI);
app.use('/users', usersAPI);

startDatabase().then(async () => {
  app.listen(3000, async () => {
    console.log('listening on port 3000');
  });
});

let connections = [];

app.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');

  closeDatabase(() => {
    console.log('Closed out database connection');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
