import {
  Organisation,
  Sensor,
  SensorDocument,
  User,
  UserDocument,
  OrgDocument,
  GrowableDocument,
  TeamDocument,
  Team,
  Growable,
} from '@eg/doc-db';
import { sum } from 'lodash';
import { isAfter, subDays } from 'date-fns';
import { AuthUser, getAuthUsers } from './authQuery';

const toOrgIdLookup = <T extends { organisationId?: string }>(
  docs: T[],
): Record<string, T[]> => {
  const result: Record<string, T[]> = {};
  for (const doc of docs) {
    const orgId = doc.organisationId || '';
    if (!(orgId in result)) {
      result[orgId] = [];
    }
    result[orgId].push(doc);
  }
  return result;
};

const projectResults = ({
  orgs,
  users,
  devices,
  growables,
  teams,
  authUsers,
}: {
  orgs: OrgDocument[];
  users: UserDocument[];
  devices: (SensorDocument &
    Required<Pick<SensorDocument, 'organisationId'>>)[];
  growables: GrowableDocument[];
  teams: TeamDocument[];
  authUsers: AuthUser[];
}) => {
  const usersByOrgId = toOrgIdLookup(users);
  const devicesByOrgId = toOrgIdLookup(devices);

  const orgIdByUserEmail: Record<string, string> = {};
  for (const user of users) {
    orgIdByUserEmail[user.email] = user.organisationId;
  }

  const authUsersByOrgId: Record<string, AuthUser[]> = {};
  for (const authUser of authUsers) {
    const orgId = orgIdByUserEmail[authUser.email || ''];
    if (!orgId) {
      continue;
    }
    if (!(orgId in authUsersByOrgId)) {
      authUsersByOrgId[orgId] = [];
    }
    authUsersByOrgId[orgId].push(authUser);
  }

  const growablesByOrgId: Record<string, GrowableDocument[]> = {};
  const teamsByOrgId = toOrgIdLookup(teams);
  for (const growable of growables) {
    const team = growable.team as TeamDocument;
    const orgId = team.organisationId;
    if (!(orgId in growablesByOrgId)) {
      growablesByOrgId[orgId] = [];
    }
    growablesByOrgId[orgId].push(growable);
  }

  return orgs.map(({ _id: id, name, _created: createdOn, address }) => {
    const users = usersByOrgId[id] ?? [];
    const devices = devicesByOrgId[id] ?? [];
    const authUsers = authUsersByOrgId[id] ?? [];
    const teams = teamsByOrgId[id] ?? [];
    const growables = growablesByOrgId[id] ?? [];

    const deviceFirstSampleTime = Math.max(
      ...devices.map((d) => d.readingStats?.first?.getTime() ?? 0),
    );
    const deviceLastSampleTime = Math.max(
      ...devices.map((d) => d.readingStats?.last?.getTime() ?? 0),
    );
    const devicesNoSamplesCount = devices.filter((d) => !d.readingStats?.count)
      .length;

    const inactiveDate = subDays(new Date(), 1);

    const loginCount = sum(authUsers.map((u) => u.logins_count ?? 0));
    const lastLogins = authUsers
      .map((u) => u.last_login)
      .filter((lastLogin): lastLogin is string => lastLogin !== undefined)
      .map((lastLogin) => new Date(lastLogin));
    const lastLogin =
      lastLogins.length > 0
        ? new Date(Math.max(...lastLogins.map((login) => login.getTime())))
        : null;

    const userCreatedAts = authUsers
      .map((u) => u.created_at)
      .filter((ts): ts is string => ts !== undefined)
      .map((ts) => new Date(ts));
    const firstLogin =
      userCreatedAts.length > 0
        ? new Date(Math.min(...userCreatedAts.map((ts) => ts.getTime())))
        : null;

    const learners = users.filter((u) => !!u.learner).map((u) => u.learner);

    const lessonsInProgress = sum(
      learners.map((learner) => learner.getCounts().inProgress),
    );
    const lessonsCompleted = sum(
      learners.map((learner) => learner.getCounts().completed),
    );

    return {
      id,
      name,
      createdOn,
      address: address.getFullAddress(),
      userCount: users.length,
      userDeactivatedCount: users.filter((u) => u.status === 'deactivated')
        .length,
      userInvitedCount: users.filter((u) => u.status === 'invited').length,
      userActiveCount: users.filter((u) => u.status === 'active').length,
      deviceCount: devices.length,
      activeDeviceCount: devices.filter(
        (d) =>
          d.readingStats &&
          d.readingStats.last &&
          isAfter(d.readingStats.last, inactiveDate),
      ).length,
      deviceSamples: sum(devices.map((d) => d.readingStats?.count)),
      deviceFirstSample: deviceFirstSampleTime
        ? new Date(deviceFirstSampleTime)
        : null,
      deviceLastSample: deviceLastSampleTime
        ? new Date(deviceLastSampleTime)
        : null,
      devicesNoSamplesCount,
      loginCount,
      firstLogin,
      lastLogin,
      lessonsInProgress,
      lessonsCompleted,
      teamsCount: teams.length,
      growablesCount: growables.length,
    };
  });
};

/** 
Returns CSV for opening in excel
Summary across all orgs
* orgs: name, contact email, city, created on,
* devices: device count, active device count, first sample at, last sample at
* users: user count, team count, deactivated count
* usage: last login date, number of logins (for all or most active user) (get from auth0 api) 
*/
export const usageReport = async () => {
  const [
    orgs,
    users,
    devices,
    teams,
    growables,
    authUsers,
  ] = await Promise.all([
    Organisation.find().exec(),
    User.find().exec(),
    Sensor.find({ _organisation: { $exists: true } }).exec() as Promise<
      (SensorDocument & Required<Pick<SensorDocument, 'organisationId'>>)[]
    >,
    Team.find().exec(),
    Growable.find().populate('team').exec(),
    getAuthUsers(),
  ]);

  return projectResults({ orgs, users, devices, teams, growables, authUsers });
};
