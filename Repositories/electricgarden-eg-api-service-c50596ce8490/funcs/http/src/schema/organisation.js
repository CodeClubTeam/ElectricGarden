import config from '../config';
import commonModel from './common.js';
import mongoose from 'mongoose';

const baseConfig = config.database.baseConfig;

var orgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logoUrl: String,
    /*management: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},*/
    address: {
      line1: String,
      line2: String,
      line3: String,
      country: String,
      postcode: String,
    },
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  baseConfig,
);

orgSchema.static('findByName', async function(name) {
  return this.findOne({ name });
});

module.exports = commonModel.discriminator('organisation', orgSchema);
