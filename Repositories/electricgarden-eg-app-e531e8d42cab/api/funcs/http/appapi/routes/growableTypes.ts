import { GrowableType, GrowableTypeDocument } from '@eg/doc-db';

import { AppRequestHandler } from '../typings';

interface GrowableTypeResource {
  id: string;
  name: string;
  title: string;
  observables: string[];
}

const mapToResource = ({
  id,
  name,
  title,
  observables,
}: GrowableTypeDocument): GrowableTypeResource => ({
  id,
  name,
  title,
  observables: [...observables],
});

export const getAll: AppRequestHandler = async (req, res) => {
  const types = await GrowableType.find().exec();
  res.send(types.map(mapToResource));
};
