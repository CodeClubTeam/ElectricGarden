const util = require('../utils/util.js');
const mongoose = require('mongoose');
const orgModel = require('../schema/organisation.js');
const config = require('../config').default;

async function getMe(req, res) {
  var org = await orgModel
    .findById(req.user._organisation)
    .catch(function(err) {
      req.logger.log(err); // or err.toString() ?
    });
  if (org == null) {
    res.json({ error: 'Could not find organisation' });
    return;
  }
  res.json(util.cleanKeys(org.populate()));
}

async function getSingleById(req, res) {
  if (
    !(
      req.params &&
      'orgId' in req.params &&
      typeof req.params.orgId === 'string'
    )
  ) {
    res.json({ error: 'No organisation ID provided' });
    req.logger.error('No organisation ID provided - how did we get here ???');
    return;
  }
  if (req.params.orgId === 'me') {
    // special
    return await getMe(req, res);
  }

  var org = await orgModel.findById(req.params.orgId).catch(function(err) {
    req.logger.log(err); // or err.toString() ?
  });
  if (org == null) {
    res.json({ error: 'Could not find organisation' });
    return;
  }
  res.json(util.cleanKeys(org.populate()));
}

async function getList(req, res) {
  // check for search stuff in req.body if applicable
  var search = {};

  if (req.body) {
    [search] = util.parseSearchBody(req.body);
  }

  const orgs = await orgModel.find(search).populate();

  let orgArr = orgs.map(util.cleanKeys);

  res.json(orgArr);
}
getList.requiredRole = 'su';

async function create(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ error: 'You did not pass in an organisation object to create' });
    return;
  }
  req.logger.log('Create Organisation', req.body);

  var createList = req.body,
    promises = [];
  if (!Array.isArray(createList)) {
    createList = [createList];
  }
  for (var createOrg of createList) {
    //if (verifyOrgData(createOrg)) {
    createOrg.auth = [];
    createOrg = util.cleanKeys(createOrg);
    delete createOrg.id;

    let existingOrg = await orgModel.findByName(createOrg.name);

    if (existingOrg == null) {
      let newOrg = new orgModel(createOrg)
        .save()
        .then(function(value) {
          req.logger.log('Created organisation', value);
          return value;
        })
        .catch(function(err) {
          req.logger.log('Error creating organisation', err);
          return { success: false, error: err };
        });
      promises.push(newOrg);
    } else {
      promises.push(
        Promise.resolve({
          success: false,
          error: 'Name already exists: ' + createOrg.name,
        }),
      );
    }
    //} else {
    //	promises.push(Promise.resolve({error: 'Organisation object did not validate'}));
    //}
  }

  let createdOrgs = await Promise.all(promises);
  let returnJson = createdOrgs.map(function(org) {
    if (!('_id' in org)) {
      return org;
    }
    return { success: true, value: util.cleanKeys(org) };
  });

  res.json(returnJson);
}
create.requiredRole = 'su';

async function update(req, res) {
  res.json({ todo: true });
}
update.requiredRole = 'su';

module.exports.getMe = getMe;
module.exports.getSingleById = getSingleById;
module.exports.getList = getList;
module.exports.create = create;
module.exports.update = update;
