import config from '../config';
import commonModel from './common.js';
import mongoose from 'mongoose';

const baseConfig = config.database.baseConfig;

var teamSchema = new mongoose.Schema(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    users: [mongoose.Schema.Types.ObjectId],
    sensors: [mongoose.Schema.Types.ObjectId],
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  baseConfig,
);

teamSchema.static('findByUserId', async function(userId) {
  return this.find({ users: userId });
});

module.exports = commonModel.discriminator('team', teamSchema);
