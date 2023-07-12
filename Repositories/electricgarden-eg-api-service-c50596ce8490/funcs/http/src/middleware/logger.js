function oneLine(func) {
  if (typeof func !== 'function') {
    func = console.log;
  }
  return function(...args) {
    /*for (let i in args) {
			try {
				if (typeof args[i] === 'object') {
					args[i] = JSON.stringify(args[i]);
				}
			} catch (err) {}
		}
		func(...args);*/
    func(JSON.stringify(args));
  };
}

module.exports = function(req, res, next) {
  if ('context' in req && 'log' in req.context) {
    //console.log(Object.keys(req.context).join(', '));
    req.logger = {
      log: oneLine(req.context.log),
      info: oneLine(req.context.info || req.context.log.info),
      warn: oneLine(req.context.warn || req.context.log.warn),
      error: oneLine(req.context.error || req.context.log.error),
    };
  }
  if (!('logger' in req)) {
    req.logger = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  }
  //req.logger.info('Logging ready.');
  next();
};
