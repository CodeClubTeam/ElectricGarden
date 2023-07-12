import faker from 'faker';
import moment from 'moment';

import { Role, Status } from '../../utils';
import { ApiServer } from './shared';

const DELAY_MS = 2000;

const mockServer: ApiServer = {
    user: {
        getCurrent: function(orgId?: string): Promise<ServerUser> {
            return Promise.resolve(getMockData().defaultCurrentUser).then(
                delay(DELAY_MS),
            );
        },
        create: function(users: ServerUpdateUser[], orgId?: string) {
            const userList = getMockData().defaultUsers;
            const user = users[0];
            userList.push({
                id: `${Math.random()}`,
                teams: [],
                date: Date.now(),
                ...user,
            });
            return Promise.resolve(userList.map(success)).then(delay(DELAY_MS));
        },
        list: function(orgId?: string): Promise<TotalList<ServerUser>> {
            return Promise.resolve(
                getTotalList(getMockData().defaultUsers),
            ).then(delay(DELAY_MS));
        },
        update: function(
            userId: string,
            user: ServerUpdateUser,
            orgId?: string,
        ) {
            let defaultUsers = getMockData().defaultUsers;
            let existingUserIndex = defaultUsers.findIndex(
                (a) => a.id === userId,
            );
            defaultUsers[existingUserIndex] = {
                ...defaultUsers[existingUserIndex],
                ...user,
            };
            return Promise.resolve(
                success(defaultUsers[existingUserIndex]),
            ).then(delay(DELAY_MS));
        },
    },
    team: {
        list: function(orgId?: string): Promise<TotalList<ServerTeam>> {
            return Promise.resolve(
                getTotalList(getMockData().defaultTeams),
            ).then(delay(DELAY_MS));
        },
    },
    sensor: {
        list: function(orgId?: string): Promise<TotalList<ServerSensor>> {
            return Promise.resolve(
                getTotalList(getMockData().defaultSensors),
            ).then(delay(DELAY_MS));
        },
        listAll: function(): Promise<TotalList<ServerSuperUserSensor>> {
            return Promise.resolve(
                getTotalList(getMockData().defaultSuSensors),
            ).then(delay(DELAY_MS));
        },
        create: function(
            sensors: ServerUpdateSensor[],
            orgId?: string,
        ): Promise<Success<ServerSensor>[]> {
            return Promise.resolve(
                getMockData().defaultSensors.map(success),
            ).then(delay(DELAY_MS));
        },
        update: function(
            sensorId: string,
            sensor: ServerUpdateSensor,
            orgId?: string,
        ) {
            let defaultSensors = getMockData().defaultSensors;
            let existingSensorIndex = defaultSensors.findIndex(
                (a) => a.id === sensorId,
            );
            defaultSensors[existingSensorIndex] = {
                ...defaultSensors[existingSensorIndex],
                ...sensor,
            };
            return Promise.resolve(
                success(getMockData().defaultSensors[existingSensorIndex]),
            ).then(delay(DELAY_MS));
        },
        plantTypes: function() {},
        data: {
            list: function(sensorSerial: string): Promise<ServerDataPoint[]> {
                return Promise.resolve(
                    getMockData().defaultData[sensorSerial],
                ).then(delay(DELAY_MS));
            },
        },
        observation: {},
    },
    organisation: {
        list: function(): Promise<TotalList<ServerOrganisation>> {
            return Promise.resolve(
                getTotalList(getMockData().defaultOrgs),
            ).then(delay(DELAY_MS));
        },
        getCurrent: function(): Promise<ServerOrganisation> {
            return Promise.resolve(getMockData().defaultOrgs[0]).then(
                delay(DELAY_MS),
            );
        },
        create: function(organisations: CreateOrganisation[]) {
            const orgList = getMockData().defaultOrgs;
            const org = organisations[0];
            orgList.push({
                id: `${Math.random()}`,
                ...org,
            });

            return Promise.resolve(success(orgList)).then(delay(DELAY_MS));
        },
    },
};

function getTotalList<T>(items: T[]): TotalList<T> {
    return { items, total: items.length };
}

function success<T>(value: T): Success<T> {
    return { value, success: true };
}

function delay(ms: number) {
    return <T>(arg: T) =>
        new Promise<T>((resolve, reject) => {
            setTimeout(() => resolve(arg), ms);
        });
}

let mockData: ReturnType<typeof generateMockData>;
function getMockData() {
    if (!mockData) {
        mockData = generateMockData();
    }
    return mockData;
}

function generateMockData() {
    faker.seed(1234);

    const defaultCurrentUser: ServerUser = {
        id: faker.random.uuid(),
        name: 'Test User',
        email: 'fake@example.com',
        date: new Date('2018-10-10T04:20:00+13:00').valueOf(),
        role: Role.su,
        status: Status.active,
        teams: [],
    };

    const defaultUsers: ServerUser[] = [defaultCurrentUser];
    for (let i = 0; i < 100; i++) {
        const id = faker.random.uuid();
        defaultUsers.push({
            id,
            name: faker.fake('{{name.firstName}} {{name.lastName}}'),
            email: faker.internet.email(),
            date: faker.date.recent(60).valueOf(),
            role: faker.random.arrayElement([
                'member',
                'leader',
                'admin',
            ] as Role[]),
            status: faker.random.arrayElement([
                'invited',
                'active',
                'deactivated',
            ] as Status[]),
            teams: [],
        });
    }

    const defaultTeams: ServerTeam[] = [];
    for (let i = 0; i < 10; i++) {
        let id = faker.random.uuid();
        defaultTeams.push({
            id: id,
            name: faker.company.companyName().replace(',', ''),
            date_created: faker.date.recent(60).valueOf(),
            users: [],
            sensors: [],
        });
    }

    const defaultOrgs: ServerOrganisation[] = [];
    for (let i = 0; i < 5; i++) {
        let id = faker.random.uuid();
        defaultOrgs.push({
            id: id,
            name: faker.company.companyName(),
            logo: '',
            address: {
                line1: faker.address.streetAddress(),
                line2: faker.address.city(),
                postcode: faker.address.zipCode(),
                country: faker.address.country(),
            },
        });
    }

    let sensorNames = [
        'Mrs Smith’s Veggies',
        'West fence fruit trees',
        'Driveway sunflowers',
        'Sensor 000855',
        'Unassigned Sensor',
    ];
    const defaultSuSensors: ServerSuperUserSensor[] = [];
    for (let i = 0; i < sensorNames.length; i++) {
        let id = faker.random.uuid();

        defaultSuSensors.push({
            _id: id,
            friendlyName: sensorNames[i],
            serial: faker.random.uuid(),
            organisationId: defaultOrgs[0].id,
        });
    }

    const defaultSensors: Sensor[] = defaultSuSensors
        .slice(0, 3)
        .map((suSensor) => ({
            id: suSensor._id,
            name: suSensor.friendlyName,
            serial: suSensor.serial,
        }));

    // Teams to Users
    for (let user of defaultUsers) {
        let teamCount = faker.random.number(4);
        for (let i = 0; i < teamCount; i++) {
            let team = faker.random.arrayElement(defaultTeams);
            user.teams.push({
                id: team.id,
                name: team.name,
            });
        }
    }

    // Teams to Sensors
    for (let sensor of defaultSensors) {
        let teamCount = faker.random.number(4);
        for (let i = 0; i < teamCount; i++) {
            let team = faker.random.arrayElement(defaultTeams);
            team.sensors.push({
                id: sensor.id,
            });
        }
    }

    const defaultData: Dict<ServerDataPoint[]> = {};
    for (let sensor of defaultSensors) {
        let data: ServerDataPoint[] = [];
        let date = moment();
        for (let j = 0; j < 1000; j++) {
            date.subtract(30, 'minutes');
            data.push({
                id: j.toString(),
                timestampSeconds: date.valueOf() / 1000,
                timestamp: date.valueOf(),
                readings: {
                    probe_soil_temp: Math.random() * 5 + 15,
                    probe_air_temp: Math.random() * 3 + 10,
                    probe_moisture: Math.random() * 3 + 0,
                    ambient_humidity: Math.random() * 3 + 3,
                    light_sensor: Math.random() * 64000,
                },
            });
        }
        defaultData[sensor.serial] = data;
    }

    return {
        defaultCurrentUser,
        defaultUsers,
        defaultTeams,
        defaultSuSensors,
        defaultSensors,
        defaultData,
        defaultOrgs,
    };
}

export default mockServer;
