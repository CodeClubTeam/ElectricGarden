import { createNewOrg, deleteOrg } from '@eg/core';
import {
  AddressProperties,
  Organisation,
  OrgDocument,
  OrgMode,
  Team,
  orgModes,
} from '@eg/doc-db';
import * as yup from 'yup';
import { usageReport } from '../services/usageReport';
import { AppRequestHandler } from '../typings';

interface OrganisationResource {
  id: string;
  name: string;
  address: AddressProperties;
  mode?: OrgMode;
  createdOn: Date;
  defaultTeamId?: string;
}

const mapToResource = ({
  id,
  name,
  address,
  mode,
  defaults: { teamId: defaultTeamId },
  _created,
}: OrgDocument): OrganisationResource => ({
  id,
  name,
  address: address.getProperties(),
  mode,
  createdOn: _created,
  defaultTeamId: defaultTeamId?.toHexString(),
});

const addressValidator = yup
  .object<AddressProperties>()
  .shape({
    line1: yup.string().required(),
    line2: yup.string(),
    line3: yup.string(),
    city: yup.string().required(),
    country: yup.string().required().oneOf(['New Zealand']),
    postcode: yup
      .string()
      .required()
      .matches(/^[0-9]{4,4}$/, {
        message: 'Postcode must be four digits',
        excludeEmptyString: true,
      }),
  })
  .required();

const orgCreateValidator = yup
  .object()
  .shape({
    name: yup
      .string()
      .required()
      .test({
        name: 'unique-name',
        message: 'An organisation with the name "${value}" already exists.',
        test: async (name) => {
          const existing = await Organisation.findOneByName(name);
          return !existing;
        },
      }),
    address: addressValidator,
    mode: yup.string().oneOf(orgModes),
  })
  .required();

const orgIdFromParamsValidator = yup
  .object()
  .shape({
    orgId: yup.string().required(),
  })
  .required();

export const getSingleById: AppRequestHandler = async (req, res) => {
  const { orgId } = orgIdFromParamsValidator.validateSync(req.params);

  const organisation = await Organisation.findOneById(orgId);
  if (!organisation) {
    return res.sendStatus(404);
  }
  res.send(mapToResource(organisation));
};
getSingleById.requiredRole = 'admin' as const;

export const getList: AppRequestHandler = async (req, res) => {
  let orgs: OrgDocument[];

  if (req.user.role == 'su') {
    orgs = await Organisation.find().exec();
  } else {
    // Not superuser, so restricting to own org
    orgs = await Organisation.find({ _id: req.user.organisationId }).exec();
  }

  res.send(orgs.map(mapToResource));
};
getList.requiredRole = 'admin' as const;

export const create: AppRequestHandler = async (req, res) => {
  const { name, address, mode } = await orgCreateValidator.validate(req.body);

  const organisation = await createNewOrg({
    organisation: { name, address, mode },
  });
  const mappedOrg = mapToResource(organisation);
  req.logger.info('Created organisation', mappedOrg);

  return res
    .status(201)
    .location(`/v1/organisations/${organisation.id}`)
    .send(mappedOrg);
};
create.requiredRole = 'su' as const;

const orgUpdateValidatorCreate = (orgId: string) =>
  yup
    .object()
    .shape({
      name: yup.string().required(),
      address: addressValidator,
      mode: yup.string().oneOf(orgModes),
      defaultTeamId: yup
        .string()
        .test(
          'team exists if specified',
          'Must be a valid team',
          async (teamId) => {
            if (!teamId) {
              return true;
            }
            const team = await Team.findOneById(teamId);
            return !!team && team._organisation.equals(orgId);
          },
        ),
    })
    .required();

export const update: AppRequestHandler = async (req, res) => {
  const { orgId } = orgIdFromParamsValidator.validateSync(req.params);

  const organisation = await Organisation.findOneById(orgId);
  if (!organisation) {
    return res.sendStatus(404);
  }

  const orgUpdateValidator = orgUpdateValidatorCreate(orgId);

  const {
    name,
    address: { line1, line2, line3, city, country, postcode },
    defaultTeamId,
    mode,
  } = await orgUpdateValidator.validate(req.body);
  Object.assign(organisation, {
    name,
    address: { line1, line2, line3, city, country, postcode },
    mode,
  });
  if (defaultTeamId) {
    const team = await Team.findOneById(defaultTeamId);
    organisation.defaults.teamId = team?.id;
  } else {
    organisation.defaults.teamId = undefined;
  }
  await organisation.save();

  return res.send(mapToResource(organisation));
};
update.requiredRole = 'admin' as const;

export const remove: AppRequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res
      .status(403)
      .send('No deletes of orgs on production yet as needs careful analysis');
  }

  const { orgId } = orgIdFromParamsValidator.validateSync(req.params);

  if (req.user._trueOrganisation.equals(orgId)) {
    return res.status(403).send('Cant delete your own org!');
  }

  await deleteOrg(orgId);

  return res.sendStatus(204);
};
remove.requiredRole = 'su' as const;

export const stats: AppRequestHandler = async (req, res) => {
  const data = await usageReport();

  res.send(data);
};
stats.requiredRole = 'su' as const;
