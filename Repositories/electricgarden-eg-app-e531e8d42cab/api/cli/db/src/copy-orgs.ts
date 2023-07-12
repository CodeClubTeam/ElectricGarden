require('dotenv').config();
import mongoose from 'mongoose';

/* copies selected orgs and active su users, selected sensor nodes to new coll */
/* NOTE: only su role users not teams or growables or all sensor nodes */

const ORG_NAMES_TO_KEEP = [
  'Product Test FW 3.0',
  'EG FW 3.0 Field Test',
  'Mr Macgregors Patch',
];

const SERIALS_TO_KEEP = [
  // Scott's requested
  '2S4KB2C',
  '2S4KB2D',
  '2S4KB2F',
  '8N31PAF',
  '8N31PAN',
  '8N31PAG',
  // Alan's LORA v2
  '3HLL8DX',
];

async function run() {
  const oldConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING!,
    { useNewUrlParser: true },
  );
  const newConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING_NEW!,
    { useNewUrlParser: true },
  );
  console.log('copying orgs');

  const oldOrgsColl = oldConn.useDb('db').collection('organizations');
  const newOrgsColl = newConn.useDb('db').collection('organizations');

  const records = await oldOrgsColl.find({}).toArray();

  console.log(`records found: ${records.length}`);

  console.log('copying records');
  await newOrgsColl.insertMany(records);

  console.log('done!');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unhandled error.');
    console.error(err);
    process.exit(1);
  });
