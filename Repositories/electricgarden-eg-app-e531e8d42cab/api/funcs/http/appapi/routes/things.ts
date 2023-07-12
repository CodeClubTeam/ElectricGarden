import { Thing, ThingDocument } from '@eg/doc-db';

import { AppRequestHandler } from '../typings';

type ThingResource = {
  serial: string;
};

const mapToResource = ({ serial }: ThingDocument): ThingResource => ({
  serial,
});

export const getAll: AppRequestHandler = async (_req, res) => {
  const things = await Thing.find({ serial: { $exists: true } }).exec();

  res.send(things.map(mapToResource));
};
getAll.requiredRole = 'su' as const;
