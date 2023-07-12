import { Sensor, SensorDocument } from '@eg/doc-db';
import * as yup from 'yup';
import { AppRequestHandler } from '../typings';
import * as util from '../utils/util';

const mapToResource = ({
  _organisation,
  serial,
  name,
  id,
}: SensorDocument) => ({
  organisationId: _organisation,
  id,
  serial,
  name,
});

export const getList: AppRequestHandler = async (req, res) => {
  let search: any = {},
    options = {};
  if (req.body) {
    [search, options] = util.parseSearchBody(req.body);
  }
  search._organisation = req.user._organisation;

  const sensors = await util.findHelper(Sensor, search, options);

  res.send(sensors.map(mapToResource));
};

const serialParamsValidator = yup
  .object()
  .shape({
    serial: yup.string().required('No node serial provided'),
  })
  .required();

export const getBySerial: AppRequestHandler = async (req, res) => {
  const { serial } = serialParamsValidator.validateSync(req.params);

  const sensor = await Sensor.findOneBySerial(serial);
  if (sensor == null) {
    req.logger.warn(`Sensor not found with serial: ${serial}.`);
    return res.status(404).send(`Sensor not found with serial: ${serial}.`);
  }

  res.send(mapToResource(sensor));
};
