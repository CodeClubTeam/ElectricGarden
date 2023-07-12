const util = require('../utils/util.js');
const mongoose = require('mongoose');
const teamModel = require('../schema/team');
const userModel = require('../schema/user');
const sensorModel = require('../schema/sensorNode');
const config = require('../config').default;

async function getTeamById(teamId) {
  var team = await teamModel.findById(teamId).catch(function(err) {
    req.logger.log(err); // or err.message ?
  });
  return team; //the team record, or null
}

async function getSingleById(req, res) {
  if (
    !(
      req.params &&
      'teamId' in req.params &&
      typeof req.params.teamId === 'string'
    )
  ) {
    res.json({ error: 'No team ID provided' });
    req.logger.error('No team ID provided - how did we get here ???');
  }

  var team = await getTeamById(req.params.userId);
  if (team == null) {
    res.json({ error: 'Could not find team' });
    return;
  }
  res.json(formatTeam(team.populate()));
}

async function getList(req, res) {
  // check for search stuff in req.body if applicable
  var search = {},
    options = {};

  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }
  search._organisation = req.user._organisation;

  const teams = await util.findHelper(teamModel, search, options);

  let teamArr = teams.map(formatTeam);

  res.json(teamArr);
}

async function getListForUser(req, res) {
  var userId = req.user._id;
  if (req.params && 'userId' in req.params && req.params.userId.length === 24) {
    userId = req.params.userId;
  }

  const teams = await teamModel.findByUserId(userId);

  let teamArr = teams.map(formatTeam);

  res.json(teamArr);
}

async function create(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a team object to create' });
    return;
  }
  req.logger.log('Create Team', req.body);

  var createList = req.body,
    promises = [];
  if (!Array.isArray(createList)) {
    createList = [createList];
  }
  for (var createTeam of createList) {
    if (verifyTeamData(createTeam)) {
      createTeam = util.cleanKeys(createTeam);
      let users = [],
        sensors = [];
      if ('users' in createTeam) {
        // Do a search for all of these IDs
        // Add actual existing users to users array.
        let userDocs = await userModel
          .find({
            _organisation: req.userObj._organisation,
            _id: { $in: toObjectIds(createTeam.users) },
          })
          .populate();
        users = userDocs.map(function(doc) {
          return doc._id;
        });
      }
      if ('sensors' in createTeam) {
        // Do a search for all of these IDs
        // Add actual existing sensors to sensors array.
        // (This should also map serials to proper database _id)
        let sensorDocs = await sensorModel
          .find({
            _organisation: req.userObj._organisation,
            $or: [
              { _id: { $in: toObjectIds(createTeam.sensors) } },
              { serial: { $in: createTeam.sensors } },
            ],
          })
          .populate();
        sensors = sensorDocs.map(function(doc) {
          return doc._id;
        });
      }
      createTeam = {
        _organisation: req.user._organisation,
        name: createTeam.name,
        users,
        sensors,
      };

      let existingTeam = await teamModel
        .findOne({
          _organisation: createTeam._organisation,
          name: createTeam.name,
        })
        .populate();

      if (existingTeam == null) {
        let newTeam = new teamModel(createTeam)
          .save()
          .then(function(value) {
            req.logger.log('Created team', value);
            return value;
          })
          .catch(function(err) {
            req.logger.warn('Error creating team', err);
            return { success: false, error: err.message };
          });
        promises.push(newTeam);
      } else {
        promises.push(
          Promise.resolve({
            success: false,
            error: 'Team name already exists: ' + createTeam.name,
          }),
        );
      }
    } else {
      promises.push(
        Promise.resolve({
          success: false,
          error: 'Team object did not validate',
        }),
      );
    }
  }

  let createdTeams = await Promise.all(promises);
  let returnJson = createdTeams.map(function(team) {
    if (!('_id' in team)) {
      return team;
    }
    return { success: true, value: formatTeam(team) };
  });

  res.json(returnJson);
}
create.requiredRole = 'leader';

async function update(req, res) {
  res.json({ todo: true });
}
update.requiredRole = 'leader';

function toObjectIds(arr) {
  return arr
    .filter((x) => x.length === 24)
    .map((x) => mongoose.Types.ObjectId(x));
}

function verifyTeamData(team) {
  let valid =
    'name' in team && typeof team.name === 'string' && team.name.length > 2;
  if ('users' in team) {
    if (!util.checkArrayType(team.users, 'string')) {
      valid = false;
    }
  }
  if ('sensors' in team) {
    if (!util.checkArrayType(team.sensors, 'string')) {
      valid = false;
    }
  }
  return valid;
}

async function addUser(req, res) {
  if (
    !(
      req.params &&
      'teamId' in req.params &&
      typeof req.params.teamId === 'string'
    )
  ) {
    res.json({ error: 'No team ID provided' });
    req.logger.error('No team ID provided - how did we get here ???');
  }
  if (
    !(
      req.params &&
      'userId' in req.params &&
      typeof req.params.userId === 'string'
    )
  ) {
    res.json({ error: 'No user ID provided' });
    req.logger.error('No user ID provided - how did we get here ???');
  }
  const teamId = req.params.teamId,
    userId = req.params.userId;

  // check team exists in org, check user exists in org, add user to team

  const existingTeam = await getTeamById(teamId);
  if (
    existingTeam == null ||
    existingTeam._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'No team with that ID exists' });
    return;
  }

  const existingUser = await userModel.findById(userId).catch(function(err) {
    req.logger.log(err);
  });
  if (
    existingUser == null ||
    existingUser._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'Could not find user' });
    return;
  }

  if (existingTeam.users.indexOf(existingUser._id) !== -1) {
    res.json({
      success: false,
      error: 'That user is already assigned to this team!',
    });
    return;
  }

  let updatedTeam = await teamModel
    .findByIdAndUpdate(
      teamId,
      { $push: { users: existingUser._id } },
      { strict: true, new: true },
    )
    .catch(function(err) {
      req.logger.warn('Error adding user to team', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedTeam) {
    res.json({ success: true, value: formatTeam(updatedTeam) });
  }
}
addUser.requiredRole = 'leader';

async function removeUser(req, res) {
  if (
    !(
      req.params &&
      'teamId' in req.params &&
      typeof req.params.teamId === 'string'
    )
  ) {
    res.json({ error: 'No team ID provided' });
    req.logger.error('No team ID provided - how did we get here ???');
  }
  if (
    !(
      req.params &&
      'userId' in req.params &&
      typeof req.params.userId === 'string'
    )
  ) {
    res.json({ error: 'No user ID provided' });
    req.logger.error('No user ID provided - how did we get here ???');
  }
  const teamId = req.params.teamId,
    userId = req.params.userId;

  // check team exists, remove user from team

  const existingTeam = await getTeamById(teamId);
  if (
    existingTeam == null ||
    existingTeam._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'No team with that ID exists' });
    return;
  }

  const existingUser = await userModel.findById(userId).catch(function(err) {
    req.logger.log(err);
  });
  if (existingUser == null) {
    res.json({ success: false, error: 'Could not find user' });
    return;
  }

  let updatedTeam = await teamModel
    .findByIdAndUpdate(
      teamId,
      { $pull: { users: existingUser._id } },
      { strict: true, new: true },
    )
    .catch(function(err) {
      req.logger.warn('Error removing user from team', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedTeam) {
    res.json({ success: true, value: formatTeam(updatedTeam) });
  }
}
removeUser.requiredRole = 'leader';

async function addSensor(req, res) {
  if (
    !(
      req.params &&
      'teamId' in req.params &&
      typeof req.params.teamId === 'string'
    )
  ) {
    res.json({ error: 'No team ID provided' });
    req.logger.error('No team ID provided - how did we get here ???');
  }
  if (
    !(
      req.params &&
      'sensorId' in req.params &&
      typeof req.params.sensorId === 'string'
    )
  ) {
    res.json({ error: 'No sensor ID provided' });
    req.logger.error('No sensor ID provided - how did we get here ???');
  }
  const teamId = req.params.teamId,
    sensorId = req.params.sensorId;

  // check team exists in org, check sensor exists in org, add sensor to team

  const existingTeam = await getTeamById(teamId);
  if (
    existingTeam == null ||
    existingTeam._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'No team with that ID exists' });
    return;
  }

  const existingSensor = await sensorModel
    .findByIdOrSerialOrName(sensorId)
    .catch(function(err) {
      req.logger.log(err);
    });
  if (
    existingSensor == null ||
    existingSensor._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'Could not find sensor' });
    return;
  }

  if (existingTeam.sensors.indexOf(existingSensor._id) !== -1) {
    res.json({
      success: false,
      error: 'That sensor is already assigned to this team!',
    });
    return;
  }

  let updatedTeam = await teamModel
    .findByIdAndUpdate(
      teamId,
      { $push: { sensors: existingSensor._id } },
      { strict: true, new: true },
    )
    .catch(function(err) {
      req.logger.warn('Error adding sensor to team', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedTeam) {
    res.json({ success: true, value: formatTeam(updatedTeam) });
  }
}
addSensor.requiredRole = 'leader';

async function removeSensor(req, res) {
  if (
    !(
      req.params &&
      'teamId' in req.params &&
      typeof req.params.teamId === 'string'
    )
  ) {
    res.json({ error: 'No team ID provided' });
    req.logger.error('No team ID provided - how did we get here ???');
  }
  if (
    !(
      req.params &&
      'sensorId' in req.params &&
      typeof req.params.sensorId === 'string'
    )
  ) {
    res.json({ error: 'No sensor ID provided' });
    req.logger.error('No sensor ID provided - how did we get here ???');
  }

  // check team exists in org, remove sensor from team

  const existingTeam = await getTeamById(teamId);
  if (
    existingTeam == null ||
    existingTeam._organisation.toHexString() !==
      req.user._organisation.toHexString()
  ) {
    res.json({ success: false, error: 'No team with that ID exists' });
    return;
  }

  const existingSensor = await sensorModel
    .findByIdOrSerialOrName(sensorId)
    .catch(function(err) {
      req.logger.log(err);
    });
  if (existingSensor == null) {
    res.json({ success: false, error: 'Could not find sensor' });
    return;
  }

  let updatedTeam = await teamModel
    .findByIdAndUpdate(
      teamId,
      { $pull: { sensors: existingSensor._id } },
      { strict: true, new: true },
    )
    .catch(function(err) {
      req.logger.warn('Error removing sensor from team', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedTeam) {
    res.json({ success: true, value: formatTeam(updatedTeam) });
  }
}
removeSensor.requiredRole = 'leader';

function formatTeam(teamObj) {
  if ('toObject' in teamObj) {
    teamObj = teamObj.toObject();
  }
  teamObj.users = teamObj.users.map(function(id) {
    return { id: id };
  });
  teamObj.sensors = teamObj.sensors.map(function(id) {
    return { id: id };
  });
  return util.cleanKeys(teamObj);
}

exports.helper = {};
exports.helper.format = formatTeam;

exports.getSingleById = getSingleById;
exports.getList = getList;
exports.getListForUser = getListForUser;
exports.create = create;
exports.update = update;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.addSensor = addSensor;
exports.removeSensor = removeSensor;
