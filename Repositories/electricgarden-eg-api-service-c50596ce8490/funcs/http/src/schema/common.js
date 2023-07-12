import config from '../config';
import mongoose from 'mongoose';

const commonModel = mongoose.model(
  'Common',
  new mongoose.Schema({}, config.database.baseConfig),
);

export default commonModel;
