import { Logger } from '@azure/functions';
import { OrgDocument, Sensor, Thing, ThingDocument } from '@eg/doc-db';
import { disconnectDb, exampleOrganisation, initDb } from '@eg/test-support';
import { deviceInactivityNotifierCreate } from '../deviceInactivityNotifier';
import { createNewOrg } from '../organisations';

const joeAdmin: Parameters<typeof createNewOrg>[0]['admin'] = {
  name: 'Joe Test',
  email: 'joe@electricgarden.nz',
};

const logger: Logger = (...args: any) => {
  console.log(...args);
};
logger.info = console.info;
logger.warn = console.warn;
logger.error = console.error;
logger.verbose = console.trace;

// TODO: proper mock scenarios for inactive serials (second arg here)
const deviceInactivityNotifier = deviceInactivityNotifierCreate(logger, () =>
  Promise.resolve(['ABC123']),
);

describe('Inactive device serial checker', () => {
  const currentDate = new Date();
  const futureDate = new Date('01 Jan 2070 00:00:00 GMT');

  let organisation: OrgDocument;

  beforeEach(async () => {
    await initDb();
    organisation = await createNewOrg({
      organisation: exampleOrganisation(),
      admin: joeAdmin,
    });
    const thing = new Thing({ serial: 'ABC456' });
    const thingSensor = (org?: OrgDocument, thing?: ThingDocument) => ({
      _organisation: organisation._id,
      name: 'Test',
      serial: thing?.serial,
    });
    const sensor = new Sensor(thingSensor(organisation, thing));
    await sensor.save();
  });

  afterAll(disconnectDb);

  it('Expect the resulting serial list to be defined', async () => {
    const serialList = await deviceInactivityNotifier(currentDate);
    expect(serialList).toBeDefined(); //Can't test for specific length due to variability over time
    //const sensor = await Sensor.findOneBySerial('ABC456');
    //console.log('Data for serial: ', sensor?.organisationId);
  });
  // it('Expect future date input to be accepted', async () => {
  //   const serialList = await deviceInactivityNotifier(futureDate);
  //   expect(serialList).toBeDefined(); //Can't test for specific length due to variability over time
  // });
});
