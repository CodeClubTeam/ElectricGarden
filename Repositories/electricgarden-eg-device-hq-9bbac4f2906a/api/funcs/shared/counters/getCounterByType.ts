import counterTypesByName from "./counters-lookup.json"; // generated using counters-to-json.py in firmware repo

export type CounterDefinition = {
  name: string;
  error?: boolean;
};

const counterNamesByType = Object.entries(
  counterTypesByName as Record<string, number>,
).reduce((result, [name, type]) => {
  result[type] = name;
  return result;
}, {} as Record<number, string>);

export const getCounterByType = (
  type: number,
  encodingVersion = 1,
): CounterDefinition => {
  // when next encoding version, this will have to have a lookup for each version
  let name = counterNamesByType[type];
  if (!name) {
    console.warn(
      `Counter not found of type number: ${type}(0x${type.toString(
        16,
      )}) on encoding version: ${encodingVersion}.`,
    );
    name = `Unknown-0x${type.toString(16)}`;
  }
  const result: CounterDefinition = {
    name,
  };
  if (type >= 0x80) {
    result.error = true;
  }
  return result;
};
