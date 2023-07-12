#!/usr/bin/env ts-node --files -P ./scripts/tsconfig.json -r dotenv/config

import { sendNotificationEmail } from '@eg/core';
import { User } from '@eg/doc-db';

User.findOneByEmail('joe@electricgarden.nz').then((joe) => {
  if (!joe) {
    console.error('joe user not found');
    process.exit(1);
  }
  sendNotificationEmail(joe.id, {
    ruleTitle: 'My Rule',
    growableTitle: 'Weedy weed',
    metricTitle: 'Frosted',
    serial: 'ABC123',
    minValue: 0,
    //maxValue: 30,
    value: -3,
    timestamp: new Date(),
  }).finally(() => {
    process.exit(0);
  });
});
