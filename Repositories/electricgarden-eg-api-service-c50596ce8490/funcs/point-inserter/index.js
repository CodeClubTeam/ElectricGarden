/*
{
  "GID": string, // Gateway ID
  // Node ID
  "NID": [{
	  "T": string, // Date Time
	  ":light": string, // Sensor reading
	  ":temp": string, // Sensor reading
	  ":humidity": string, // "
	  ":moisture": string, // "
  }]
}
*/

//const crypto = require('crypto');
const mongoose = require('mongoose');

const database = {
  connectionString:
    'mongodb://electric-garden-cosmos:1zuvaBXL9eATAsSxz1scmHWpNfnq5IY1inExxnT4NvnqMzotn8OTHaeL0LzYnkb2xjuFkolAbMvYnz8mkwxU0w%3D%3D@electric-garden-cosmos.documents.azure.com:10255/?ssl=true&replicaSet=globaldb',
  baseConfig: {
    discriminatorKey: '_type',
    collection: 'points',
  },
};

const commonModel = mongoose.model(
  'Common',
  new mongoose.Schema({}, database.baseConfig),
);

const pointSchema = new mongoose.Schema(
  {
    nodeSerial: {
      type: String,
      required: true,
    },
    gatewaySerial: {
      type: String,
      required: true,
    },
    timestampSeconds: {
      type: String,
      required: true,
    },
    readings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    _created: {
      type: Date, // Date or Number ? Unsure which makes more sense...
      default: Date.now,
    },
    _partitionKey: {
      type: String,
      required: true,
    },
  },
  database.baseConfig,
);
const pointModel = commonModel.discriminator('point', pointSchema);

// 30 minutes
const PartitionQuantization = 1800;

function QuantizeTimeStamp(timestampSeconds, quantization) {
  return quantization * Math.floor(timestampSeconds / quantization);
}

function ParseTimestamp(timestamp) {
  const secondsEpoch = parseInt(timestamp);
  if (isNaN(secondsEpoch)) {
    // We presume its a parsable string then
    return Math.floor(Date.parse(timestamp) / 1000); // Divide milliseconds to seconds
  } // Else it is seconds epoch
  return secondsEpoch;
}

function doCoolStuff(context, queueItem) {
  context.log('Doing cool stuff...');
  let gatewayID = queueItem['GID'];

  var count = 0;

  for (let nodeID of Object.keys(queueItem).filter(
    (propertyName) => !['GID', 'ORG', 'HB'].includes(propertyName),
  )) {
    for (let sensorEvent of queueItem[nodeID]) {
      ++count;
      // If the timestamp is a number, then we expect it to be a seconds epoch
      // Otherwise it'll be a string in the form of a parsable date.
      let timestampSeconds = ParseTimestamp(sensorEvent.T); // Date.parse returns milliseconds
      if (isNaN(timestampSeconds)) {
        throw Error(
          `Failed to parse timestamp ${sensorEvent.T}. Cannot process message.`,
        );
      }
      let readings = {};
      for (let sensorName of Object.keys(sensorEvent).filter(
        (propertyName) => propertyName[0] == ':',
      )) {
        readings[sensorName.substring(1)] = sensorEvent[sensorName];
      }
      //let bytes = crypto.randomBytes(16);
      //let newId = nodeID + '_' + bytes.readUInt32LE().toString(36) + (+new Date()).toString(36) + bytes.readUInt32LE(4).toString(36);
      let record = {
        //_id: newId,
        _partitionKey:
          '30m_' + QuantizeTimeStamp(timestampSeconds, PartitionQuantization),
        _type: 'point',
        nodeSerial: nodeID,
        gatewaySerial: gatewayID,
        timestampSeconds,
        readings,
      };

      //context.bindings.pointDocument = JSON.stringify(record);

      var newPoint = new pointModel(record)
        .save()
        .then(function(value) {
          context.log('Added point', value);
          if (--count < 1) {
            context.done();
          }
        })
        .catch(function(err) {
          context.log('Error adding point', err);
          if (--count < 1) {
            context.done();
          }
        });

      context.log('Push Event,', record._partitionKey, JSON.stringify(record));
    }
  }

  if (count < 1) {
    context.done();
  }
}

module.exports = function(context, myQueueItem) {
  context.log(
    'JavaScript point queue trigger function processed work item:',
    myQueueItem,
  );
  const queueItem = Object.assign({}, myQueueItem);

  mongoose.connect(database.connectionString, { useNewUrlParser: true });

  const db = mongoose.connection;

  db.on('error', function(...args) {
    context.log('DB connection error:', ...args);
  });
  db.once('open', function() {
    context.log('Connected to DB');
    doCoolStuff(context, queueItem);
  });
};
