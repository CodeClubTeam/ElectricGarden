const SERIAL_ALPHABET = '123456789ABCDFGHJKLMNPSTWXZ';

function divmod(numerator: number, denominator: number) {
  const quotient = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  return [quotient, remainder];
}

// Converts base27 string to integer
function serialLoads(base27string: string) {
  let value = 0;
  const radix = SERIAL_ALPHABET.length;
  const base27len = base27string.length;
  for (let i = 0; i < base27string.length; i++) {
    const char = base27string[i];
    const power = base27len - i - 1;
    const mul = SERIAL_ALPHABET.indexOf(char);
    value += mul * Math.pow(radix, power);
  }
  return value;
}

// Convert serial string to type, batch and unit numbers
function serialToBatch(serialString: string) {
  const serialNumeral = serialLoads(serialString);

  const [serialNumeral2, unit] = divmod(serialNumeral, 10000);
  const [typeN, batch] = divmod(serialNumeral2, 100000);

  return { typeN: typeN, batch, unit };
}

type Batch = ReturnType<typeof serialToBatch>;

function validateBatch(batch: Batch) {
  return (batch.typeN === 1 || batch.typeN === 2) && batch.batch === 0;
}

export function isValidSerial(serial: string) {
  const batch = serialToBatch(serial);
  return validateBatch(batch);
}
