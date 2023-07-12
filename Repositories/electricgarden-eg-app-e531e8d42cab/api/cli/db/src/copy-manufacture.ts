require('dotenv').config();
import mongoose from 'mongoose';

/* copies all of manufature to new collection */

async function run() {
  const oldConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING!,
    { useNewUrlParser: true },
  );
  const newConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING_NEW!,
    { useNewUrlParser: true },
  );
  console.log('copying manufacture collection');

  const oldOrgsColl = oldConn.useDb('db').collection('manufacture');
  const newOrgsColl = newConn.useDb('db').collection('manufacture');

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
