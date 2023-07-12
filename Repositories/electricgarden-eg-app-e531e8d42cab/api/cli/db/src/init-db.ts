// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { mongoose } from '@eg/doc-db';
import { ensureGrowableTypesLoaded, ensureProductsLoaded } from './staticData';

const insertStaticData = async () => {
  await ensureGrowableTypesLoaded();
  await ensureProductsLoaded();
};

const createPointsIndexes = async () => {
  const pointsColl = mongoose.connection.db.collection('points');
  await pointsColl.createIndex({
    nodeSerial: 1,
  });
  await pointsColl.createIndex({
    growable: 1,
  });
};

const createOrgIndexes = async () => {
  const orgsColl = mongoose.connection.db.collection('organizations');
  await orgsColl.createIndex({
    _type: 1,
  });
  await orgsColl.createIndex({
    _organisation: 1,
  });
};

const createManufactureIndexes = async () => {
  const coll = mongoose.connection.db.collection('manufacture');
  await coll.createIndex({
    _type: 1,
  });
  await coll.createIndex({
    serial: 1,
  });
};

const createIndexes = async () => {
  console.log('creating indexes');
  await createPointsIndexes();
  await createOrgIndexes();
  await createManufactureIndexes();
};

const initDb = async () => {
  await insertStaticData();
  await createIndexes();
};

initDb()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
