#!/usr/bin/env node
const mongoose = require('mongoose');
const config = require('../src/config');
const Organisation = require('../src/schema/organisation');
const User = require('../src/schema/user');
const SensorNode = require('../src/schema/sensorNode');
const DataPoint = require('../src/schema/dataPoint');

const initialOrganisation = {
  address: {
    line1: '1 Hidden Close',
    line2: 'Lake District',
    line3: '',
    postcode: 'ZZH123',
    country: 'England',
  },
  name: 'Mr Macgregors Patch',
};

const initialUsers = [
  {
    name: 'Alan Christensen',
    email: 'alan@electricgarden.nz',
  },
  {
    name: 'Peter Bayne',
    email: 'peter@electricgarden.nz',
  },
  {
    name: 'Michael Trengrove',
    email: 'michael@codeclub.nz',
  },
  {
    name: 'Joe Mulder',
    email: 'joe@electricgarden.nz',
  },
  {
    name: 'Rebecca Donnelly',
    email: 'rebecca@codeclub.nz',
  },
  {
    name: 'Kate Allan',
    email: 'kate@codeclub.nz',
  },
];

const initialSensorNodes = [
  {
    name: 'Cottontail',
    serial: 'C0TTON',
  },
  {
    name: 'Flopsy',
    serial: 'FL0PS4',
  },
  {
    name: 'Mopsy',
    serial: 'M0PS4',
  },
];

const dayAgo = Date.now() / 1000 - 24 * 60 * 60;

const main = async () => {
  let organisation = await Organisation.findOne({
    name: initialOrganisation.name,
  }).exec();
  if (!organisation) {
    organisation = new Organisation(initialOrganisation);
    await organisation.save();
  }
  for (const { name, email } of initialUsers) {
    let user = await User.findOne({
      email,
      _organisation: organisation.id,
    }).exec();
    if (!user) {
      user = new User({
        name,
        email,
        _organisation: organisation.id,
        status: 'active',
        role: 'su',
      });
      await user.save();
    }
  }
  for (const { name, serial } of initialSensorNodes) {
    let sensorNode = await SensorNode.findOne({
      serial,
      _organisation: organisation.id,
    }).exec();
    if (!sensorNode) {
      sensorNode = new SensorNode({
        name,
        serial,
        _organisation: organisation.id,
      });
      await sensorNode.save();
    }
    //seed sensor with datapoints for the last day
    await DataPoint.deleteMany({
      nodeSerial: { $eq: sensorNode.serial },
      timestampSeconds: { $gte: dayAgo },
    }).exec();
    const step = Math.PI / 24.0;
    let sensordata = [];
    for (let i = 0; i < 48; i++) {
      const theTime = dayAgo + i * 30 * 60;
      const quantized = 1800 * Math.floor(theTime / 1800);
      const partition = '30m_' + quantized.toString();
      let readings = {
        probe_soil_temp: 14 + Math.sin(i * step) * 3,
        rst_wdt: 124,
        probe_air_temp: 15.5 + Math.sin(i * step) * 2,
        battery_voltage: 0.3671875 - 0.01 * i,
        ambient_temperature: 20.27122 + Math.sin(i * step) * 6,
        probe_moisture: 6.655262 - (i % 5),
        rssi: -23,
        rst_pwr: 18,
        light_sensor: 290 + Math.sin(i * step) * 50,
        snr: 6,
        ambient_humidity: 50.03052 + Math.cos(i * step) * 5,
      };
      const datapoint = new DataPoint({
        nodeSerial: sensorNode.serial,
        gatewaySerial: 'Seeded',
        timestampSeconds: theTime,
        _partitionKey: partition,
        readings: readings,
      });
      sensordata.push(datapoint);
      if (sensorNode.serial === initialSensorNodes[1].serial) {
        // Let the second sensor be plugged in, so that it records every 30s
        let fastSensorData = [];
        for (let j = 1; j < 60; j++) {
          const timeNow = theTime + j * 30;
          readings.probe_air_temp += 0.01;
          readings.ambient_temperature += 0.01;
          readings.probe_moisture += 0.01;
          readings.light_sensor += 0.01;
          readings.ambient_humidity += 0.01;
          const datapoint30s = new DataPoint({
            nodeSerial: sensorNode.serial,
            gatewaySerial: 'Seeded',
            timestampSeconds: timeNow,
            _partitionKey: partition,
            readings: readings,
          });
          fastSensorData.push(datapoint30s);
        }
        await DataPoint.insertMany(fastSensorData);
      }
    }
    await DataPoint.insertMany(sensordata);
  }
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
