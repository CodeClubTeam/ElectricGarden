const util = require('../utils/util.js');
//const mongoose = require('mongoose');
const sensorModel = require('../schema/sensorNode');
const hardwareModel = require('../schema/hardwareThing');
const config = require('../config').default;

async function getList(req, res) {
  var search = {},
    options = {};
  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }
  search._organisation = req.user._organisation;

  const sensors = await util.findHelper(sensorModel, search, options);

  let sensorArr = sensors.map(util.cleanKeys);

  res.json(sensorArr);
}

async function getListAll(req, res) {
  //look in manufacture collection, also check for each if there is friendly name and organisation, if so add it in too

  var search = {},
    options = {};
  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }

  const nodes = await hardwareModel
    .findNode(search, null, options)
    .populate()
    .catch(function(err) {
      req.logger.warn('Could not find hardware nodes', err);
      res.json({ error: err });
    });

  if (nodes != null) {
    let sensors = {};
    let sensorsList = await sensorModel.find().populate(); //await util.findHelper(sensorModel, search, options);
    if (sensorsList != null) {
      for (let s of sensorsList) {
        sensors[s.serial] = s;
      }
    }
    const nodeArr = nodes.map(function(node) {
      node = node.toObject();
      node.id = node._id;
      node.hardware = node._hardware;
      node = util.cleanKeys(node);
      if (node.serial in sensors) {
        node.friendlyName = sensors[node.serial].name;
        node.organisationId = sensors[node.serial]._organisation;
      }
      return node;
    });

    res.json(nodeArr);
  }
}
getListAll.requiredRole = 'su';

async function getBySerialOrName(req, res) {
  if (
    !(
      req.params &&
      'nodeId' in req.params &&
      typeof req.params.nodeId === 'string'
    )
  ) {
    res.json({ error: 'No node serial/name provided' });
    req.logger.error('No node serial/name provided - how did we get here ???');
    return;
  }

  const sensor = await sensorModel.findBySerialOrName(req.params.nodeId);

  if (sensor == null) {
    res.json({ error: 'Could not find sensor' });
    return;
  }

  res.json(util.cleanKeys(sensor.populate()));
}

async function create(req, res) {
  // Get in serial number, organisation, and friendly name.
  // Check that serial number exists in manufacture collection
  // And that serial number and friendly name does not exist in organisation collection
  // Then we can create it
  // REMEMBER: We also support setting organisation here

  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a sensor node object to create!' });
    return;
  }

  var createList = req.body,
    promises = [];
  if (!Array.isArray(createList)) {
    createList = [createList];
  }

  for (let createNode of createList) {
    let org =
      createNode._organisation ||
      createNode.organisation ||
      req.user._organisation;
    createNode = util.cleanKeys(createNode);
    delete createNode.id;
    createNode._organisation = org;

    if (verifyNodeData(createNode)) {
      // Check for hardware node

      const node = await hardwareModel
        .findOneNode({ serial: createNode.serial })
        .populate();
      if (node != null) {
        // does exist, check for matching serial or name

        let existingNode = await sensorModel
          .findOne({
            $or: [{ name: createNode.name }, { serial: createNode.serial }],
          })
          .populate();

        if (existingNode == null) {
          let newSensor = new sensorModel(createNode)
            .save()
            .then(function(value) {
              req.logger.log('Created sensor', value);
              return value;
            })
            .catch(function(err) {
              req.logger.warn('Error creating sensor', createNode.serial, err);
              return { success: false, error: err.message };
            });
          promises.push(newSensor);
        } else {
          //already created, don't create
          promises.push(
            Promise.resolve({
              success: false,
              error: `Sensor node already exists, ${createNode.serial}:${createNode.name} ${existingNode.serial}:${existingNode.name}`,
            }),
          );
        }
      } else {
        //hardware doesn't seem to exist, don't create
        promises.push(
          Promise.resolve({
            success: false,
            error: `Hardware sensor node does not exist, serial ${createNode.serial}`,
          }),
        );
      }
    } else {
      promises.push(
        Promise.resolve({
          success: false,
          error: 'Sensor object did not validate',
        }),
      );
    }
  }

  let createdSensors = await Promise.all(promises);
  let returnJson = createdSensors.map(function(sensor) {
    if (!('_id' in sensor)) {
      return sensor;
    }
    sensor.organisation = sensor._organisation;
    return { success: true, value: util.cleanKeys(sensor) };
  });

  res.json(returnJson);
}
create.requiredRole = 'su';

async function update(req, res) {
  // REMEMBER: We also support setting organisation here
  if (
    !(
      req.params &&
      'nodeId' in req.params &&
      typeof req.params.nodeId === 'string'
    )
  ) {
    res.json({ error: 'No node serial/name provided' });
    req.logger.error('No node serial/name provided - how did we get here ???');
    return;
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a sensor node object to update!' });
    return;
  }

  const sensor = await sensorModel.findByIdOrSerialOrName(req.params.nodeId);

  if (sensor == null) {
    res.json({ error: 'Could not find sensor' });
    return;
  }
  var nodeId = sensor._id;

  let org = req.body._organisation || req.body.organisation || null;
  let updates = util.cleanKeys(req.body);
  delete updates.id;

  // Support changing node organisation
  if ('organisation' in updates) {
    delete updates.organisation;
  }
  if (org != null) {
    updates._organisation = org;
  }

  if ('serial' in updates) {
    if (updates.serial === sensor.serial) {
      // not changing
      delete updates.serial;
    } else {
      // TODO: If changing serial or friendly name, check to see if it already exists
    }
  }
  if ('name' in updates) {
    if (updates.name === sensor.name) {
      // not changing
      delete updates.name;
    } else {
      // TODO: If changing serial or friendly name, check to see if it already exists
    }
  }

  var updatedSensor = await sensorModel
    .findByIdAndUpdate(nodeId, updates, { strict: true, new: true })
    .catch(function(err) {
      req.logger.warn('Error updating sensor', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedSensor) {
    res.json({ success: true, value: util.cleanKeys(updatedSensor) });
  } else {
    try {
      res.json({ success: false, error: 'Could not update sensor' });
    } catch (err) {}
  }
}
update.requiredRole = 'su';

function verifyNodeData(node) {
  return (
    node != null &&
    typeof node === 'object' &&
    node.name != null &&
    node.serial != null &&
    node._organisation != null &&
    typeof node.name === 'string' &&
    typeof node.serial === 'string' &&
    node.name.length > 2 &&
    node.serial.length > 2
  );
}

module.exports.getList = getList;
module.exports.getListAll = getListAll;
module.exports.getBySerialOrName = getBySerialOrName;
module.exports.create = create;
module.exports.update = update;
