const config = require('./config').default;
const createHandler = require('azure-function-express').createHandler;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { checkJwt, populateUserInfo } = require('./middleware/auth');

const fs = require('fs-extra');

const isDevelopmentMode = !!process.env.LOCAL_EXPRESS_MODE;

const util = require('./utils/util');
const swaggerDocumentPath = fs.existsSync(__dirname + '/swagger/api.yaml')
  ? __dirname + '/swagger/api.yaml'
  : './swagger/api.yaml';
const swaggerDocument = YAML.load(swaggerDocumentPath);
/* try {
	swaggerDocument = YAML.load('./swagger/api.yaml');
} catch (err) {
	console.log('Could not load yaml', err);
} */

/* Require custom middleware */
const middlewareImpersonation = require('./middleware/impersonation');
const middlewareCheckUser = require('./middleware/checkUser');
const middlewareLogger = require('./middleware/logger');
/* End Require custom middleware */

/* Require APIs */
const userApi = require('./routes/user');
const organisationApi = require('./routes/organisation');
const teamApi = require('./routes/team');
const dataApi = require('./routes/sensorData');
const sensorApi = require('./routes/sensorNode');
const observationApi = require('./routes/observation');
/* End Require APIs */

// Permissions check (should be in a middleware file)
function testRole(func) {
  return function(req, res, next) {
    //check func.requiredRole against user.role - order is as config.user.roles
    if (!('user' in req) || !util.roleCheck(req.user.role, func.requiredRole)) {
      res.status(401).json({
        error: 'You do not have permission to use this functionality',
      });
      return;
    }

    // TODO: Add "last login" update (might be a different function)

    func(req, res, next);
  };
}

// Function to wrap middleware
function middleware(func, ...args) {
  return asyncHandler(testRole(func), ...args);
}
const api = express.Router();

var app = express();

app.use(cors());

// Logger in req
app.use(middlewareLogger);

app.use(checkJwt);

// Azure already has the body parsed
// bodyParser.json will just hang
// https://github.com/yvele/azure-function-express/issues/15
if (isDevelopmentMode) {
  // Parse json in req.body stream
  api.use(bodyParser.json());
}

api.use(populateUserInfo);

api.use(middlewareCheckUser);

// SuperUsers can impersonate things (e.g. change their organisation for a single request)
api.use(middlewareImpersonation);

api.use(function(req, res, next) {
  var claims = req.authInfo;
  // req.logger.log('User info: ', req.user);
  // req.logger.log('Validated claims: ', claims);
  if ('toObject' in req.user) {
    req.userObj = req.user.toObject();
  } else {
    req.userObj = req.user;
  }
  next();
});

// Error Handler!
api.use(function(err, req, res, next) {
  // error handling logic
  //req.logger.error(err);
  console.warn(err);
  res.status(500).send({ error: 'api: ' + err.message });
});

mongoose.set('debug', config.database.debug || false);
mongoose.connect(config.database.connectionString, {
  useNewUrlParser: true,
  dbName: config.database.name,
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to DB');
});

/* API Routes */

api.get('/user', middleware(userApi.getMe));
api.post('/user', middleware(userApi.create));
api.get('/user/apikey', middleware(userApi.getApiKey));
api.patch('/user/apikey', middleware(userApi.newApiKey));
api.delete('/user/apikey', middleware(userApi.removeApiKey));
api.get('/user/list', middleware(userApi.getList));
api.post('/user/list', middleware(userApi.getList));
api.get('/user/:userId', middleware(userApi.getSingleById));
api.put('/user/:userId', middleware(userApi.update));
api.patch('/user/:userId', middleware(userApi.update));

api.get('/organisation', middleware(organisationApi.getMe));
api.post('/organisation', middleware(organisationApi.create));
api.get('/organisation/list', middleware(organisationApi.getList));
api.post('/organisation/list', middleware(organisationApi.getList));
api.get('/organisation/:orgId', middleware(organisationApi.getSingleById));

api.get('/team', middleware(teamApi.getListForUser));
api.post('/team', middleware(teamApi.create));
api.get('/team/list', middleware(teamApi.getList));
api.get('/team/:teamId', middleware(teamApi.getSingleById));
api.put('/team/:teamId/user/:userId', middleware(teamApi.addUser));
api.put('/team/:teamId/sensor/:sensorId', middleware(teamApi.addSensor));

api.post('/sensor', middleware(sensorApi.create));

api.get('/sensor/list_from_data', middleware(dataApi.getNodesFromData));

api.get('/sensor/list', middleware(sensorApi.getList));
api.get('/sensor/list/all', middleware(sensorApi.getListAll));
api.post('/sensor/list/all', middleware(sensorApi.getListAll));

api.get('/sensor/:nodeId', middleware(sensorApi.getBySerialOrName));
api.patch('/sensor/:nodeId', middleware(sensorApi.update));
api.post('/sensor/:nodeId', middleware(sensorApi.update));

api.get('/sensor/:nodeId/data', middleware(dataApi.getDataByNode));
api.post('/sensor/:nodeId/data', middleware(dataApi.getDataByNode));

api.get('/sensor/:nodeId/observation', middleware(observationApi.getList));
api.post('/sensor/:nodeId/observation', middleware(observationApi.create));
api.get('/sensor/:nodeId/observation/list', middleware(observationApi.getList));
api.post(
  '/sensor/:nodeId/observation/list',
  middleware(observationApi.getList),
);

api.get(
  '/sensor/:nodeId/observation/:observationId',
  middleware(observationApi.getById),
);
api.put(
  '/sensor/:nodeId/observation/:observationId',
  middleware(observationApi.update),
);
api.patch(
  '/sensor/:nodeId/observation/:observationId',
  middleware(observationApi.update),
);

/* End API Routes */

app.use('/v1', api);
app.use('/api/v1', api);

//app.get('/', getUsersList);
app.all('/', (req, res) => {
  req.logger.info('Request for root/ completed.');
  res.end(util.makeHTML('Welcome to Electric Garden API.'));
});
app.all('/api', (req, res) => {
  req.logger.info('Request for root/ completed.');
  res.end(util.makeHTML('Welcome to Electric Garden API.'));
});

app.use(function(err, req, res, next) {
  // error handling logic
  //req.logger.error(err);
  console.warn(JSON.stringify(err));
  res.status(500).send({ error: err.message, trace: err.trace });
});

if (swaggerDocument != null) {
  try {
    console.log('API document available, ' + swaggerDocumentPath);
    let swaggerServ;
    let swaggerStaticPath = __dirname + '/api.html';
    if (fs.existsSync(swaggerStaticPath)) {
      swaggerServ = function(req, res) {
        res.sendFile('api.html', { root: __dirname });
      };
    } else {
      swaggerServ = swaggerUi.setup(swaggerDocument);
    }
    //app.use('/static', express.static(path.join(__dirname, 'public')))
    app.use('/api-docs', swaggerUi.serve, swaggerServ);
    api.use('/docs', swaggerUi.serve, swaggerServ); // /v1/docs
    app.use('/api/docs', swaggerUi.serve, swaggerServ);
    app.use('/docs', swaggerUi.serve, swaggerServ);
  } catch (err) {
    console.warn(
      'Swagger UI did not load! Online documentation will not be available.',
      err.message,
      err.stack.replace(/[\r\n]+/, '\\n'),
    );
  }
}

if (isDevelopmentMode) {
  // Running locally rather than azure, so tell express to actively listen
  let port = process.env.PORT || 80;
  app.listen(port);
  console.log(`Listening on port ${port}`);
}

module.exports = createHandler(app);

// testing

app.all(
  /.*/,
  asyncHandler(function(req, res) {
    (req.context || console).log('Request for * completed. ', req.path);
    const exists = [
      fs.existsSync(__dirname + '/indexTemplate.html'),
      fs.existsSync(__dirname + '\\indexTemplate.html'),
      fs.existsSync('./swagger/api.yaml'),
      fs.existsSync(__dirname + '/swagger/api.yaml'),
      fs.existsSync(__dirname + '\\index.js'),
      fs.existsSync(swaggerDocumentPath),
      swaggerDocument != null,
    ];
    res.json({
      path: req.path,
      method: req.method,
      dirname: __dirname,
      exists,
      swaggerDocumentPath,
    });
  }),
);
