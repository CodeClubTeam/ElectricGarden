const util = require('../utils/util.js');
//const mongoose = require('mongoose');
const userModel = require('../schema').User;
const teamModel = require('../schema/team');
const teamHelper = require('./team').helper;
const userRoles = require('../config').default.user.roles;
const crypto = require('crypto');
const email = require('../email/email-util');

async function getMe(req, res) {
  // Find current user details (probably already on req object by this time)
  // return it
  if (req.user != null) {
    let user = req.user.toObject();
    let teams = await teamModel.findByUserId(user._id);
    teams = teams.map(teamHelper.format);
    res.json(Object.assign({ teams }, util.cleanKeys(user)));
  } else {
    req.logger.log('getMe but no me!');
    res.json({ error: 'No current user in request' });
  }
}

async function getUserById(userId) {
  var user = await userModel.findById(userId).catch(function(err) {
    req.logger.log(err); // or err.message ?
  });
  return user; //the user record, or null
}

async function getSingleById(req, res) {
  if (
    !(
      req.params &&
      'userId' in req.params &&
      typeof req.params.userId === 'string'
    )
  ) {
    res.json({ error: 'No user ID provided' });
    req.logger.error('No user ID provided - how did we get here ???');
    return;
  }
  if (req.params.userId === 'me') {
    // special
    return await getMe(req, res);
  }

  var user = await getUserById(req.params.userId);
  if (user == null) {
    res.json({ error: 'Could not find user' });
    return;
  }
  res.json(util.cleanKeys(user.populate()));
}

async function getList(req, res) {
  // check for search stuff in req.body if applicable
  var search = {},
    options = {};

  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }
  search._organisation = req.user._organisation;

  const users = await util.findHelper(userModel, search, options);

  let userArr = users.map(util.cleanKeys);

  res.json(userArr);
}

async function getApiKey(req, res) {
  if (
    'user' in req &&
    '_apikey' in req.user &&
    typeof req.user._apikey === 'string' &&
    req.user._apikey.length > 4
  ) {
    res.json({ apikey: req.user._apikey });
  } else {
    res.json({ message: 'No API key' });
  }
}

async function newApiKey(req, res) {
  let existingUser = null;
  let apikey = null;
  do {
    let bytes = crypto.randomBytes(16);
    apikey =
      bytes.readUInt32LE().toString(36) +
      (+new Date()).toString(36) +
      bytes.readUInt32LE(4).toString(36);
    existingUser = await userModel.findByApiKey(apikey);
  } while (existingUser != null);
  // update user
  req.userDoc._apikey = apikey;
  req.userDoc
    .save()
    .then(function(usr) {
      req.logger.log(
        'Created new API key',
        usr._apikey,
        'for',
        usr._id.toString(),
      );
      res.json({ apikey });
    })
    .catch(function(err) {
      req.logger.warn('Error updating API key', err);
      res.status(500).json({ error: err.message });
    });
}

async function removeApiKey(req, res) {
  req.userDoc._apikey = null;
  req.userDoc
    .save()
    .then(function(usr) {
      req.logger.log('Removed API key for', usr._id.toString());
      res.json({ success: true });
    })
    .catch(function(err) {
      req.logger.warn('Error removing API key', err);
      res.status(500).json({ error: err.message });
    });
}

// hopefully most of this can be generic
async function create(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a user object to create' });
    return;
  }
  req.logger.log('create user', req.body);

  var createList = req.body,
    promises = [];
  if (!Array.isArray(createList)) {
    createList = [createList];
  }
  for (let createUser of createList) {
    if (
      verifyUserData(createUser) &&
      util.roleCheck(req.user.role, createUser.role)
    ) {
      createUser = util.cleanKeys(createUser);
      createUser._auth = [];
      delete createUser.id;

      let existingUser = await userModel.findByEmail(createUser.email);

      if (existingUser == null) {
        createUser._organisation = req.user._organisation;

        let newUser = new userModel(createUser)
          .save()
          .then(function(value) {
            req.logger.log('Created user', value);
            email.sendWelcomeEmail(req, createUser);
            return value;
          })
          .catch(function(err) {
            req.logger.warn('Error creating user', err);
            return { success: false, error: err.message };
          });
        promises.push(newUser);
      } else {
        promises.push(
          Promise.resolve({
            success: false,
            error: 'Email address already exists: ' + createUser.email,
          }),
        );
      }
    } else {
      promises.push(
        Promise.resolve({
          success: false,
          error: 'User object did not validate',
        }),
      );
    }
  }

  let createdUsers = await Promise.all(promises);
  let returnJson = createdUsers.map(function(user) {
    if (!('_id' in user)) {
      return user;
    }
    return { success: true, value: util.cleanKeys(user) };
  });

  res.json(returnJson);
}
create.requiredRole = 'admin';

async function update(req, res) {
  if (
    !(
      req.params &&
      'userId' in req.params &&
      typeof req.params.userId === 'string'
    )
  ) {
    res.json({ error: 'No user ID provided' });
    req.logger.error('No user ID provided - how did we get here ???');
    return;
  }
  var userId = req.params.userId;
  if (req.params.userId === 'me') {
    // special
    userId = req.userObj._id;
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in a user object to edit' });
    return;
  }
  req.logger.log('Edit user', userId, req.body);

  // Need to check user is in correct org
  var user = await getUserById(userId);
  if (
    user == null ||
    user._organisation.toHexString() !== req.user._organisation.toHexString()
  ) {
    res.json({ error: 'Could not find user' });
    return;
  }
  //let userObj = user.toObject();

  // Verification step
  let updates = util.cleanKeys(req.body); //Object.assign({}, userObj, util.cleanKeys(req.body));
  delete updates.id;
  if ('role' in updates) {
    if (!updates.role in userRoles) {
      delete updates.role;
    } else if (!util.roleCheck(req.userObj.role, updates.role)) {
      updates.role = req.userObj.role;
    }
  }

  if (!util.roleCheck(req.userObj.role, user.role)) {
    req.logger.warn(
      'Cannot update user with higher role ',
      req.user._id,
      user._id,
    );
    res.json({ success: false, error: 'Cannot update user with higher role' });
  }

  var updatedUser = await userModel
    .findByIdAndUpdate(userId, updates, { strict: true, new: true })
    .catch(function(err) {
      req.logger.warn('Error updating user', err);
      res.json({ success: false, error: err.message });
    });

  if (updatedUser) {
    res.json({ success: true, value: util.cleanKeys(updatedUser) });
  }
}
update.requiredRole = 'admin';

function verifyUserData(user) {
  var valid =
    typeof user.email === 'string' &&
    user.email.indexOf('@') !== -1 &&
    typeof user.name === 'string' &&
    user.name.length > 0 &&
    typeof user.role === 'string' &&
    userRoles.indexOf(user.role) !== -1;
  return valid;
}

module.exports.getMe = getMe;
module.exports.getSingleById = getSingleById;
module.exports.getList = getList;
module.exports.getApiKey = getApiKey;
module.exports.newApiKey = newApiKey;
module.exports.removeApiKey = removeApiKey;
module.exports.create = create;
module.exports.update = update;
