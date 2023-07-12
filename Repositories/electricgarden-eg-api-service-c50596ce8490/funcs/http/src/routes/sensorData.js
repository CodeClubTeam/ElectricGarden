const util = require('../utils/util.js');
//const mongoose = require('mongoose');
const pointModel = require('../schema/dataPoint.js');
const sensorModel = require('../schema/sensorNode');

async function getDataByNode(req, res) {
  if (
    !(
      req.params &&
      'nodeId' in req.params &&
      typeof req.params.nodeId === 'string'
    )
  ) {
    res.json({ error: 'No sensor node provided' });
    req.logger.error('No sensor node provided - how did we get here ???');
    return;
  }

  // locate sensor node
  const existingSensor = await sensorModel.findByIdOrSerialOrName(
    req.params.nodeId,
  );
  if (
    existingSensor ==
    null /*|| existingSensor._organisation.toHexString() !== req.user._organisation.toHexString()*/
  ) {
    res.json({ error: 'Could not find sensor node' });
    return;
  }

  //search
  var search = {},
    options = {};

  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }

  search.nodeSerial = existingSensor.serial; //req.params.nodeId;
  if (!options.limit) {
    // options.limit = 1000;
  }
  if (!options.sort) {
    options.sort = { timestampSeconds: -1 };
  }
  if (!options.time) {
    options.time = { maxTimeMS: 10000 };
  }
  const points = await util.findHelper(pointModel, search, options);

  let pointArr = points.map(util.cleanKeys).map((point) => {
    for (let readingKey in point.readings) {
      point.readings[readingKey] = Number(point.readings[readingKey]);
    }
    point.timestampSeconds = Number(point.timestampSeconds);
    return point;
  });

  res.json(pointArr);
}

async function getNodesFromData(req, res) {
  const dayAgo = Date.now() / 1000 - 24 * 60 * 60;
  var search = { _id: { $exists: true }, timestampSeconds: { $gt: dayAgo } };

  // TODO: Figure out how to use something like distinct or aggregate

  // const points = await pointModel.distinct('nodeSerial', search).catch(function (err) {
  // 	console.log('Error getting sensors', err);
  // });
  // const points = await pointModel.aggregate([
  //     { "$group": { "_id": "$nodeSerial" } },
  //     // { "$skip": ( page-1 ) * 15 },
  //     { "$limit": 15 }
  // ])

  const points = await pointModel
    .find(search, { nodeSerial: true })
    .sort({ timestampSeconds: -1 })
    .limit(1000)
    .populate()
    .catch(function(err) {
      console.log('Error getting point data', err);
    });

  const nodeSerialSet = new Set(points.map((point) => point.nodeSerial));

  const nodeSerialArr = Array.from(nodeSerialSet).filter(validateSerial);
  nodeSerialArr.sort();

  const sensorArr = nodeSerialArr.map((nodeSerial) => ({
    id: nodeSerial,
    name: nodeSerial,
    serial: nodeSerial,
  }));

  res.json(sensorArr);
}

function validateSerial(serial) {
  let batch = serial_to_batch(serial);
  return validateBatch(batch);
}

function validateBatch(batch) {
  return (batch.type_n === 1 || batch.type_n === 2) && batch.batch === 0;
}

let SERIAL_ALPHABET = '123456789ABCDFGHJKLMNPSTWXZ';

// Convert serial string to type, batch and unit numbers
function serial_to_batch(serial_string) {
  let serial_numeral = serial_loads(serial_string);

  let [serial_numeral2, unit] = divmod(serial_numeral, 10000);
  let [type_n, batch] = divmod(serial_numeral2, 100000);

  return { type_n, batch, unit };
}

// Converts base27 string to integer
function serial_loads(based_string) {
  let value = 0;
  let radix = SERIAL_ALPHABET.length;
  let based_len = based_string.length;
  for (let i = 0; i < based_string.length; i++) {
    let char = based_string[i];
    let power = based_len - i - 1;
    let mul = SERIAL_ALPHABET.indexOf(char);
    value += mul * Math.pow(radix, power);
  }
  return value;
}

function divmod(numerator, denominator) {
  let quotient = Math.floor(numerator / denominator);
  let remainder = numerator % denominator;
  return [quotient, remainder];
}

module.exports.getDataByNode = getDataByNode;
module.exports.getNodesFromData = getNodesFromData;
