const util = require('../utils/util.js');
//const mongoose = require('mongoose');
const observationModel = require('../schema/observation');
const sensorModel = require('../schema/sensorNode');
const config = require('../config').default;

async function getById(req, res) {
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
  if (
    !(
      req.params &&
      'observationId' in req.params &&
      typeof req.params.observationId === 'string'
    )
  ) {
    res.json({ error: 'No observation ID provided' });
    req.logger.error('No observation ID provided - how did we get here ???');
    return;
  }

  var observ = await observationModel
    .findById(req.params.observationId)
    .catch(function(err) {
      req.logger.log(err); // or err.toString() ?
    });
  if (
    observ == null ||
    observ._organisation.toHexString() !== req.user._organisation.toHexString()
  ) {
    res.json({ error: 'Could not find observation' });
    return;
  }
  res.json(util.cleanKeys(observ.populate()));
}

async function getList(req, res) {
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
    existingSensor == null ||
    existingSensor._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ error: 'Could not find sensor node' });
    return;
  }

  // check for search stuff in req.body if applicable
  var search = {},
    options = {};

  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }
  if (!options.sort) {
    options.sort = { timestampSeconds: -1 };
  }
  search._organisation = req.user._organisation;
  search.sensorNode = {
    id: existingSensor._id,
    serial: existingSensor.serial,
  };

  const observs = await util.findHelper(observationModel, search, options);

  let observArr = observs.map(util.cleanKeys);

  res.json(observArr);
}

async function create(req, res) {
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
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in an observation object to create' });
    return;
  }
  req.logger.log('create observation', req.body);

  var createList = req.body,
    promises = [];
  if (!Array.isArray(createList)) {
    createList = [createList];
  }

  for (let createObserv of createList) {
    if (verifyObservData(createObserv)) {
      createObserv = util.cleanKeys(createObserv);
      let sensor = req.params.nodeId || createObserv.sensorNode;
      if (typeof sensor === 'object') {
        if ('id' in sensor) {
          sensor = sensor.id;
        } else if ('serial' in sensor) {
          sensor = sensor.serial;
        } else if ('name' in sensor) {
          sensor = sensor.name;
        } else {
          sensor = null; //does not exist
        }
      }
      createObserv.createdBy = req.user._id;
      delete createObserv.editedBy;

      // locate sensor node
      const existingSensor = await sensorModel.findByIdOrSerialOrName(sensor);

      if (existingSensor != null && sensor != null) {
        createObserv.sensorNode = {
          id: existingSensor._id,
          serial: existingSensor.serial,
        };

        let existingObserv = await observationModel.findOne({
          'sensorNode.id': existingSensor._id,
          name: createObserv.name,
          timestampSeconds: createObserv.timestampSeconds,
        });

        if (existingObserv == null) {
          createObserv._organisation = req.user._organisation;

          let newObserv = new observationModel(createObserv)
            .save()
            .then(function(value) {
              req.logger.log('Created observation', value);
              return value;
            })
            .catch(function(err) {
              req.logger.warn('Error creating observation', err);
              return { success: false, error: err.message };
            });
          promises.push(newObserv);
        } else {
          promises.push(
            Promise.resolve({
              success: false,
              error: 'Observation already exists',
            }),
          );
        }
      } else {
        promises.push(
          Promise.resolve({
            success: false,
            error: 'Sensor node does not exist',
          }),
        );
      }
    } else {
      promises.push(
        Promise.resolve({
          success: false,
          error: 'Observation object did not validate',
        }),
      );
    }
  }

  let createdObservs = await Promise.all(promises);
  let returnJson = createdObservs.map(function(observ) {
    if (!('_id' in observ)) {
      return observ;
    }
    return { success: true, value: util.cleanKeys(observ) };
  });

  res.json(returnJson);
}

function verifyObservData(observ) {
  let valid =
    typeof observ === 'object' &&
    'timestampSeconds' in observ &&
    'name' in observ &&
    'value' in observ; // && 'sensorNode' in observ;
  /*if (valid && typeof observ.sensorNode !== 'string') {
		if (typeof observ.sensorNode !== 'object') {
			valid = false;
		} else {
			valid = valid && (('id' in observ.sensorNode) || ('serial' in observ.sensorNode) || ('name' in observ.sensorNode));
		}
	}*/
  return valid;
}

async function update(req, res) {
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
  if (
    !(
      req.params &&
      'observationId' in req.params &&
      typeof req.params.observationId === 'string'
    )
  ) {
    res.json({ error: 'No observation ID provided' });
    req.logger.error('No observation ID provided - how did we get here ???');
    return;
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a user object to edit' });
    return;
  }
  var observationId = req.params.observationId;

  var observ = await observationModel
    .findById(observationId)
    .catch(function(err) {
      req.logger.log(err); // or err.toString() ?
    });
  if (
    observ == null ||
    observ._organisation.toHexString() !== req.user._organisation.toHexString()
  ) {
    res.json({ error: 'Could not find observation' });
    return;
  }
  observationId = observ._id;

  // Verification step
  let updates = util.cleanKeys(req.body); //Object.assign({}, userObj, util.cleanKeys(req.body));
  delete updates.id;
  delete updates.createdBy;
  delete updates.editedBy;
  delete updates.sensorNode; // TODO: Allow admin to change this field?

  var updatedObserv = await observationModel
    .findByIdAndUpdate(observationId, updates, { strict: true, new: true })
    .catch(function(err) {
      req.logger.warn('Errer updating observation', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedObserv) {
    res.json({ success: true, value: util.cleanKeys(updatedObserv) });
  }
}

exports.getById = getById;
exports.getList = getList;
exports.create = create;
exports.update = update;
