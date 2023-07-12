import { HttpResponseError } from './HttpResponseError';
import { GetToken } from './shared';

const DELAY_MS = 2000;

const baseURL = process.env.REACT_APP_API_BASE_URL;

export const createServer = (getToken: GetToken) => {
    async function makeRequest<T>(
        url: string,
        orgId?: string,
        method: 'get' | 'post' | 'put' = 'get',
        body?: any,
    ): Promise<T> {
        const accessToken = await getToken();
        const headers = new Headers({
            Authorization: 'Bearer ' + accessToken,
        });
        const requestOpts: RequestInit = {
            method,
            headers,
        };
        if (body) {
            requestOpts.body = JSON.stringify(body);
            headers.set('Content-Type', 'application/json');
        }
        if (orgId) {
            headers.set('x-impersonate-organisation', orgId);
        }
        const response = await fetch(baseURL + url, requestOpts);
        if (!response.ok) {
            throw new HttpResponseError(response);
        }
        return response.json();
    }

    return {
        user: {
            getCurrent: function(orgId?: string): Promise<ServerUser> {
                return makeRequest('/user', orgId);
            },
            create: function(users: ServerUpdateUser[], orgId?: string) {
                return makeRequest<Success<ServerUser>[]>(
                    '/user',
                    orgId,
                    'post',
                    users,
                );
            },
            list: function(orgId?: string): Promise<TotalList<ServerUser>> {
                return makeRequest<ServerUser[]>('/user/list', orgId).then(
                    getTotalList,
                );
            },
            update: function(
                userId: string,
                user: ServerUpdateUser,
                orgId?: string,
            ) {
                return makeRequest<Success<ServerUser>>(
                    `/user/${userId}`,
                    orgId,
                    'put',
                    user,
                );
            },
        },
        team: {
            list: function(orgId?: string): Promise<TotalList<ServerTeam>> {
                return Promise.resolve(getTotalList([])).then(delay(DELAY_MS));
            },
        },
        sensor: {
            list: function(orgId?: string): Promise<TotalList<ServerSensor>> {
                return makeRequest<ServerSensor[]>('/sensor/list', orgId).then(
                    getTotalList,
                );
            },
            create: function(
                sensors: ServerUpdateSensor[],
                orgId?: string,
            ): Promise<Success<ServerSensor>[]> {
                return makeRequest<Success<ServerSensor>[]>(
                    '/sensor',
                    orgId,
                    'post',
                    sensors,
                );
            },
            update: function(
                sensorSerial: string,
                sensor: ServerUpdateSensor,
                orgId?: string,
            ) {
                return makeRequest<Success<ServerSensor>>(
                    `/sensor/${sensorSerial}`,
                    orgId,
                    'post',
                    sensor,
                );
            },
            listAll: function(): Promise<TotalList<ServerSuperUserSensor>> {
                return makeRequest<ServerSuperUserSensor[]>(
                    '/sensor/list/all',
                ).then(getTotalList);
            },
            plantTypes: function() {},
            data: {
                list: function(
                    sensorId: string,
                    dateRange?: any,
                    orgId?: string,
                ): Promise<ServerDataPoint[]> {
                    return makeRequest<ServerDataPoint[]>(
                        `/sensor/${sensorId}/data`,
                        orgId,
                        'post',
                        dateRange,
                    );
                },
            },
            observation: {},
        },
        organisation: {
            getCurrent: function(orgId?: string): Promise<ServerOrganisation> {
                return makeRequest<ServerOrganisation>('/organisation', orgId);
            },
            list: function(
                orgId?: string,
            ): Promise<TotalList<ServerOrganisation>> {
                return makeRequest<ServerOrganisation[]>(
                    '/organisation/list',
                    orgId,
                ).then(getTotalList);
            },
            create: function(
                organisations: CreateOrganisation[],
                orgId?: string,
            ) {
                return makeRequest<Success<ServerOrganisation[]>>(
                    '/organisation',
                    orgId,
                    'post',
                    organisations,
                );
            },
        },
    };
};

function getTotalList<T>(items: T[]): TotalList<T> {
    return { items, total: items.length };
}

function delay(ms: number) {
    return <T>(arg: T) =>
        new Promise<T>((resolve, reject) => {
            setTimeout(() => resolve(arg), ms);
        });
}
