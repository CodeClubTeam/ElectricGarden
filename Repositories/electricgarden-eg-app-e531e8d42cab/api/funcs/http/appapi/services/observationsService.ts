import { ObservationDocument, Observation } from '@eg/doc-db';

import { deleteAsset } from './assetStore';

export const deleteObservation = async (observation: ObservationDocument) => {
  if (observation.value.type === 'photographed') {
    const { assetId } = observation.value.data as any;
    await deleteAsset(assetId);
  }
  await Observation.deleteOne({ _id: observation.id });
};
