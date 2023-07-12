#!/usr/bin/env node

// just queries production database so we can see what's there
// and rip bits out for seed data

const mongoose = require('mongoose');
const config = require('../src/config');
const SensorNode = require('../src/schema/sensorNode');
const Organisation = require('../src/schema/organisation');
const User = require('../src/schema/user');

const SEED_ORG_NAME = 'Electric Garden';

const main = async () => {
  console.log(
    `Querying production database for org named: ${SEED_ORG_NAME}...`,
  );
  const organisation = await Organisation.findOne({
    name: SEED_ORG_NAME,
  }).exec();
  if (!organisation) {
    console.log(`Organisation not found with name ${SEED_ORG_NAME}. Aborting.`);
    return;
  }
  console.log('Organisation');
  console.log('%j', organisation);

  console.log('Users');
  const users = await User.find({
    _organisation: organisation.id,
  }).exec();
  console.log('%j', users);

  console.log('SensorNodes');
  const sensorNodes = await SensorNode.find({
    _organisation: organisation.id,
  }).exec();
  console.log('%j', sensorNodes);
};

mongoose.set('debug', true);
mongoose.connect(config.database.connectionString, {
  useNewUrlParser: true,
  dbName: config.database.name,
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to DB');
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(0);
    });
});
