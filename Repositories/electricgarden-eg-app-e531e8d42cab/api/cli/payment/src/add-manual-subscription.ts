require('dotenv-defaults').config();

import { createUser, createOrg } from 'eg-payments/out/routes/webhook';
import {
  Subscription,
  SubscriptionDocument,
} from '@eg/doc-db/lib/schemas/subscription';
import { mongoose, Organisation, User } from '@eg/doc-db/lib';

const commander = require('commander');

(async () => {
  try {
    const program = new commander.Command();
    program
      .helpOption('-? --help', 'display help information')
      .option('-e, --user-email', '[Required] Admin users email')
      .option('-n, --users-name', '[Required] Admin users name')
      .option('-o, --org-name', '[Required] The name for the organisation.')
      .option('--street-address', '[Required] Users street address')
      .option('--city', '[Required] Users city')
      .option('--postcode', '[Required] Users postcode')
      .option('-b, --billing-email', 'Billing email', null)
      .version('0.0.1');

    program.parse(process.argv);

    if (!program.userEmail) {
      console.error('ERROR: User email is required.');
      program.outputHelp();
      return;
    }
    if (!program.usersName) {
      console.error('ERROR: User name is required.');
      program.outputHelp();
      return;
    }
    if (!program.streetAddress || !program.city || !program.postcode) {
      console.error('ERROR: Not enough address parameters.');
      program.outputHelp();
      return;
    }
    if (!program.orgName) {
      console.error('ERROR: No org name provided..');
      program.outputHelp();
      return;
    }
    let existingUser = await User.findOneByEmail(program.userEmail);
    if (existingUser == null) {
      let org = await createOrg(program.usersName, program.orgName, {
        line1: program.streetAddress,
        line2: '',
        line3: '',
        city: program.city,
        country: 'New Zealand',
        postcode: program.postcode,
      });
      existingUser = await createUser(
        org._id,
        program.usersName,
        program.userEmail,
      );
      if (existingUser == null) {
        throw new Error('Failed to create a new user.');
      }
    }
    let org = await Organisation.findById(existingUser.organisationId);

    if (org == null) {
      throw new Error(`Failed to find org for user ${existingUser.email}`);
    }

    let subscription: SubscriptionDocument = new Subscription({
      _id: mongoose.Types.ObjectId(),
      _organisation: org._id,
      subscriptionStatus: 'active',
      billingEmail: program.billingEmail
        ? program.billingEmail
        : program.userEmail,
      _adminUser: existingUser._id,
      stripeCustomerId: null,
      isActive: true,
      source: 'manual',
    });
    await subscription.save();
  } catch (e) {
    console.error(e);
  }
})()
  .then(async (_) => {
    return await mongoose.disconnect();
  })
  .then((_) => {
    console.log('Complete!');
  });
