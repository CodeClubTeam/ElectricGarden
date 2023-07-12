import { GrowableType } from '@eg/doc-db';
import growableTypes from './growable-types.yaml';

type Config = {
  standardObservables: string[];
  types: {
    [name: string]: {
      title: string;
      observables?: string[];
    };
  };
};

export const ensureGrowableTypesLoaded = async () => {
  const { standardObservables, types } = growableTypes as Config;

  let created = 0,
    updated = 0;

  for (const [name, definition] of Object.entries(types)) {
    const observables = [
      ...standardObservables,
      ...(definition.observables || []),
    ];
    const { title } = definition;
    let growableType = await GrowableType.findOne({ name }).exec();
    if (growableType) {
      growableType.name = name;
      growableType.title = title;
      growableType.observables = observables;
      updated += 1;
    } else {
      growableType = new GrowableType({ name, title, observables });
      created += 1;
    }
    await growableType.save();
  }

  console.log(`Growable types: ${created} created. ${updated} updated.`);
};
