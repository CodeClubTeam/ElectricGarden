const config = require('../config').default;

module.exports.cleanKeys = function(modelObj) {
  let obj = modelObj;
  if ('toObject' in obj) {
    obj = obj.toObject();
  }
  if ('_id' in obj) {
    obj.id = obj._id;
  }
  if ('_created' in obj) {
    //2018-09-18 14:28:07
    obj.date_created = exports.formatDate(obj._created);
  }
  let removeKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
  for (let key of removeKeys) {
    delete obj[key];
  }
  return obj;
};

module.exports.formatDate = function(dateObj) {
  let year = dateObj.getFullYear(),
    month = ('' + (dateObj.getMonth() + 1)).padStart(2, '0'),
    day = dateObj
      .getDay()
      .toString()
      .padStart(2, '0'),
    hour = dateObj
      .getHours()
      .toString()
      .padStart(2, '0'),
    minute = dateObj
      .getMinutes()
      .toString()
      .padStart(2, '0'),
    second = dateObj
      .getSeconds()
      .toString()
      .padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

function htmlMake(obj) {
  if (typeof obj === 'string') {
    return obj;
  } else {
    var html = '';
    for (let i in obj) {
      let o = obj[i];
      let title =
        typeof o === 'object' && 'title' in o ? ` title="${o.title}"` : '';
      switch (i) {
        case 'img':
          if (typeof o === 'string') {
            o = { src: o, alt: o };
          }
          html += `<img src="${o.src}" alt="${o.alt}"${title}>`;
          break;
        case 'a':
          if (typeof o === 'string') {
            o = { href: o, body: o };
          }
          html += `<a href="${o.href}"${title}>${htmlMake(o.body)}</a>`;
          break;
        default:
          html += `<${i}${title}>${htmlMake(o)}</${i}>`;
      }
    }
    return html;
  }
}

module.exports.makeHTML = function(obj) {
  if (typeof obj === 'string') {
    obj = {
      body: { p: obj },
    };
  }
  var html = '<!DOCTYPE html><html><head>';
  if (obj.title) {
    html += '<title>' + obj.title + '</title>';
  }
  html += '</head><body>';
  html += htmlMake(obj.body);
  html += '</body></html>';
  return html;
};

module.exports.roleCheck = function(role, requiredRole) {
  if (requiredRole == null) return true; // no required role, so allowed
  const roleNum = config.user.roles.indexOf(role);
  const requiredRoleNum = config.user.roles.indexOf(requiredRole);
  if (roleNum === -1 || requiredRoleNum === -1) return false; //invalide role, denied
  return requiredRoleNum <= roleNum; // check order
};

/**
 *
 * @param {*} model The Mongoose model used for searching
 * @param {*} search An object containing MongoDB search query
 * @param {*} [options] An object containing MongoDB search options
 * @returns A promise that will resolve to the search results
 */
module.exports.findHelper = function(model, search, options) {
  if (search == null) search = {};
  if (options == null) {
    options = { limit: 200 };
  }

  delete search.id;
  search._id = { $exists: true };

  var results = model.find(search, null, options);
  //if (options.skip) {results = results.skip(options.skip);}
  //if (options.limit) {results = results.limit(options.limit);}
  results = results.populate().catch(function(err) {
    console.log('Error getting data for', model.modelName, err);
  });
  return results; // results is a promise
};

module.exports.parseSearchBody = function(body) {
  // Maybe... Change to get req object, and automatically add in _organisation checK? Think about this later
  body = Object.assign({}, body);
  var search = {},
    or = [],
    options = {};
  if (body.skip) {
    options.skip = body.skip;
  }
  if (body.limit) {
    options.limit = Math.min(Math.max(0 | body.limit, 1), 10000);
  }
  if (body.sort) {
    options.sort = body.sort;
  }
  if (body.dateRange) {
    search.timestampSeconds = {
      $gte: body.dateRange.startDate,
      $lte: body.dateRange.endDate,
    };
  }
  if (body.or) {
    body.or = exports.cleanKeys(body.or);
    body.or._id = body.or.id;
    delete body.or.id;
  } else {
    body.or = [];
  }
  if (body.and) {
    body.and = exports.cleanKeys(body.and);
    body.and._id = body.and.id;
    delete body.and.id;
  } else {
    body.and = [];
  }

  for (let k in body.or) {
    let t = typeof body.or[k];
    if (t === 'string' || t === 'number') {
      or.push({ k: body.or[k] });
    } else if (t === 'object' && ('max' in body.or[k] || 'min' in body.or[k])) {
      let comparison = {};
      if ('max' in body.or[k]) {
        comparison['$lte'] = body.or[k].max;
      }
      if ('min' in body.or[k]) {
        comparison['$gte'] = body.or[k].min;
      }
      or.push({ k: comparison });
    }
  }
  for (let k in body.and) {
    let t = typeof body.and[k];
    if (t === 'string' || t === 'number') {
      search[k] = body.and[k];
    } else if (
      t === 'object' &&
      ('max' in body.and[k] || 'min' in body.and[k])
    ) {
      let comparison = {};
      if ('max' in body.and[k]) {
        comparison['$lte'] = body.and[k].max;
      }
      if ('min' in body.and[k]) {
        comparison['$gte'] = body.and[k].min;
      }
      search[k] = comparison;
    }
  }

  if (or.length > 0) {
    search['$or'] = or;
  }

  return [search, options];
};

exports.checkArrayType = function(arr, type) {
  return (
    Array.isArray(arr) &&
    arr.every(function(i) {
      return typeof i === type;
    })
  );
};
