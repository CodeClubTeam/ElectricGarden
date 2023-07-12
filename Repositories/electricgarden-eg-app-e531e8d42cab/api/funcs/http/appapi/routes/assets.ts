import uuid = require('uuid');

import {
  getSignedUploadUrl,
  getSignedDownloadUrl,
} from '../services/assetStore';
import { AppRequestHandler } from '../typings';

// todo: consider having containers per org?
// not really sensitive data though and guids not really guessable
export const create: AppRequestHandler = async (req, res) => {
  const assetId = uuid.v4();
  const url = getSignedUploadUrl(assetId);
  res.status(201).location(url).send({ url, assetId });
};

// these two currently unused. slower alternative to using direct url (but it expires)

export const get: AppRequestHandler = async (req, res) => {
  const { assetId } = req.params;

  if (!assetId) {
    return res.sendStatus(404);
  }

  res.redirect(getSignedDownloadUrl(assetId));
};

export const getUrl: AppRequestHandler = async (req, res) => {
  const { assetId } = req.params;

  if (!assetId) {
    return res.sendStatus(404);
  }

  res.type('text/plain').send(getSignedDownloadUrl(assetId));
};
