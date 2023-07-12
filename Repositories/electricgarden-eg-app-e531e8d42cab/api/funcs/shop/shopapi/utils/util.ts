import { userConfig, UserRole } from '@eg/doc-db';
import mongoose from '@eg/doc-db/lib/db';

export const cleanKeys = (modelObj: any) => {
  let obj = modelObj;
  if (obj.toObject) {
    obj = obj.toObject();
  }
  if (obj._id) {
    obj.id = obj._id;
  }
  //2018-09-18 14:28:07
  if ('_created' in obj) {
    // eslint-disable-next-line camelcase
    obj.date_created = exports.formatDate(obj._created);
  }
  const removeKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
  for (const key of removeKeys) {
    delete obj[key];
  }
  return obj;
};

export const formatDate = (dateObj: Date) => {
  const year = dateObj.getFullYear(),
    month = ('' + (dateObj.getMonth() + 1)).padStart(2, '0'),
    day = dateObj.getDay().toString().padStart(2, '0'),
    hour = dateObj.getHours().toString().padStart(2, '0'),
    minute = dateObj.getMinutes().toString().padStart(2, '0'),
    second = dateObj.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 *
 * @param {*} role the role to check is high enough
 * @param {*} requiredRole the role to compare with (the one that must be met)
 * @returns true if the required role is satisified (or not specified)
 */
export const canHaveRole = (role: UserRole, requiredRole?: UserRole) => {
  if (!requiredRole) {
    return true; // no required role, so allowed
  }
  const roleNum = userConfig.roles.indexOf(role);
  const requiredRoleNum = userConfig.roles.indexOf(requiredRole);
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
export const findHelper = async <TModel extends mongoose.Model<any, any>>(
  model: TModel,
  search?: any,
  options?: any,
): Promise<TModel extends mongoose.Model<infer TDoc, any> ? TDoc[] : never> => {
  if (search == null) search = {};
  if (options == null) {
    options = { limit: 200 };
  }

  delete search.id;
  search._id = { $exists: true };

  const fetchResults = model.find(search, null, options);
  //if (options.skip) {fetchResults = fetchResults.skip(options.skip);}
  //if (options.limit) {fetchResults = fetchResults.limit(options.limit);}
  try {
    return await fetchResults.populate();
  } catch (err) {
    console.log('Error getting data for', model.modelName, err);
    throw err;
  }
};

export const parseSearchBody = (body: any) => {
  // Maybe... Change to get req object, and automatically add in _organisation checK? Think about this later
  body = { ...body };
  const search: any = {},
    or = [];
  const options: any = {};
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
    // oh dear
    search.timestampSeconds = {
      $gte: new Date(body.dateRange.startDate).getTime(),
      $lte: new Date(body.dateRange.endDate).getTime(),
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

  for (const k in body.or) {
    const t = typeof body.or[k];
    if (t === 'string' || t === 'number') {
      or.push({ k: body.or[k] });
    } else if (t === 'object' && ('max' in body.or[k] || 'min' in body.or[k])) {
      const comparison: any = {};
      if ('max' in body.or[k]) {
        comparison['$lte'] = body.or[k].max;
      }
      if ('min' in body.or[k]) {
        comparison['$gte'] = body.or[k].min;
      }
      or.push({ k: comparison });
    }
  }
  for (const k in body.and) {
    const t = typeof body.and[k];
    if (t === 'string' || t === 'number') {
      search[k] = body.and[k];
    } else if (
      t === 'object' &&
      ('max' in body.and[k] || 'min' in body.and[k])
    ) {
      const comparison: any = {};
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

export const checkArrayType = (arr: unknown, type: unknown) => {
  return (
    Array.isArray(arr) &&
    arr.every(function (i) {
      return typeof i === type;
    })
  );
};

export const getRequiredConfig = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable not found ${key}`);
  }
  return value;
};
