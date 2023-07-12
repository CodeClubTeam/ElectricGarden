import mongoose from './db';

export const getLastRequestCharge = async () => {
  const result = await mongoose.connection.db.command({
    getLastRequestStatistics: 1,
  });

  return result.RequestCharge;
};
