require('dotenv').config();
import mongoose from 'mongoose';

async function run() {
  const oldConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING!,
    { useNewUrlParser: true },
  );
  const newConn = await mongoose.createConnection(
    process.env.COSMOS_DB_CONNECTION_STRING_NEW!,
    { useNewUrlParser: true },
  );
  console.log('copying points');

  const oldPointsColl = oldConn.useDb('db').collection('points');
  const newPointsColl = newConn.useDb('db').collection('points');

  const points = await oldPointsColl
    .find({})
    .map((data) => {
      if (data._partitionKey) {
        data.partitionKeyOld = data._partitionKey;
        delete data._partitionKey;
      }
      // delete data._id;
      return data;
    })
    .toArray();

  console.log(`points found: ${points.length}`);
  if (points.length) {
    await newPointsColl.insertMany(points);
  }
  console.log('done!');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unhandled error.');
    console.error(err);
    process.exit(1);
  });
