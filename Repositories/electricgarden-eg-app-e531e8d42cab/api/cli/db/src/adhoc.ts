// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Growable, Sensor, User } from '@eg/doc-db';

const doThing = async () => {
  console.log('Setting all learner levels to at least 13');
  let result = await User.updateMany(
    { 'learner.level': { $lt: 13 } },
    { $set: { 'learner.level': 13 } },
  ).exec();

  console.log(JSON.stringify(result, undefined, '  '));

  console.log('removing Example Crop growables');
  result = await Growable.deleteMany({
    title: 'Example Crop',
  }).exec();
  console.log(JSON.stringify(result, undefined, '  '));

  console.log('removing EXAMPLE sensors');
  result = await Sensor.deleteMany({ serial: 'EXAMPLE' }).exec();
  console.log(JSON.stringify(result, undefined, '  '));
};

doThing()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
