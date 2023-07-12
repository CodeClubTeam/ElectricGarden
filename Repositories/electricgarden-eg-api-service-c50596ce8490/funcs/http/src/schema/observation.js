import config from '../config';
import commonModel from './common.js';
import mongoose from 'mongoose';

const baseConfig = config.database.baseConfig;

var observationSchema = new mongoose.Schema(
  {
    _organisation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sensorNode: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      serial: {
        type: String,
        required: true,
      },
    },
    timestampSeconds: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdBy: mongoose.Schema.Types.ObjectId, // user ID of who created this
    editedBy: [mongoose.Schema.Types.ObjectId], // list of user IDs that have edited this observation ?
    _created: {
      type: Date,
      default: Date.now,
    },
  },
  baseConfig,
);

observationSchema.static('findByUserId', async function(userId) {
  return this.find({ users: userId });
});

module.exports = commonModel.discriminator('observation', observationSchema);
