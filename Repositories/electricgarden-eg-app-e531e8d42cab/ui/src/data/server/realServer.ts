import {
    HttpResponseError,
    HttpValidationResponseError,
} from './HttpResponseError';
import { GetToken } from './shared';
import moment from 'moment';
import { cleanDataPoint } from '../../utils';

const baseURL = process.env.REACT_APP_API_BASE_URL;

type CreateServerOptions = {
    onHttpError?: (error: HttpResponseError) => void;
    orgId?: string;
};

export const createServer = (
    getToken: GetToken,
    { onHttpError, orgId }: CreateServerOptions = {},
) => {
    const buildUrl = (url: string) => baseURL + url;
    let organisationId = orgId;

    const makeMakeRequest = ({ tenanted }: { tenanted: boolean }) =>
        async function makeRequest<T>(
            url: string,
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
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
            if (tenanted && organisationId) {
                headers.set('x-impersonate-organisation', organisationId);
            }
            const response = await fetch(buildUrl(url), requestOpts);
            if (!response.ok) {
                const httpError =
                    response.status === 400
                        ? new HttpValidationResponseError(response)
                        : new HttpResponseError(
                              response,
                              await response.text(),
                          );
                if (onHttpError) {
                    onHttpError(httpError);
                }
                throw httpError;
            }
            if (response.status === 204) {
                return {} as T;
            }
            if (
                (response.headers.get('content-type') as string).startsWith(
                    'application/json',
                )
            ) {
                return response.json();
            }
            return ((await response.text()) as any) as T;
        };

    const makeRequest = makeMakeRequest({ tenanted: true });
    const makeNonTenantedRequest = makeMakeRequest({ tenanted: false });

    const addObservation = (
        growableId: string,
        { value, comments, occurredOn }: ServerCreateObservation,
    ) =>
        makeRequest<ServerObservation>(`/observations/${growableId}`, 'POST', {
            value,
            comments,
            occurredOn,
            recordedOn: new Date(),
        }).then(mapObservation);

    const createAsset = () => {
        return makeRequest<{
            url: string;
            assetId: string;
        }>(`/assets`, 'POST');
    };

    const mapObservation = ({
        recordedOn,
        occurredOn,
        createdOn,
        ...rest
    }: any): ServerObservation => ({
        ...rest,
        recordedOn: new Date(recordedOn),
        occurredOn: new Date(occurredOn),
        createdOn: new Date(createdOn),
    });

    const mapGrowable = ({ createdOn, ...rest }: any): ServerGrowable => ({
        createdOn: new Date(createdOn),
        ...rest,
    });

    type RawServerOrganisation = Omit<ServerOrganisation, 'createdOn'> & {
        createdOn: string;
    };
    const mapOrganisation = ({
        createdOn,
        ...rest
    }: RawServerOrganisation): ServerOrganisation => ({
        createdOn: new Date(createdOn),
        ...rest,
    });

    return {
        getOrganisationId: () => organisationId,
        setOrganisationId: (orgId: string) => {
            organisationId = orgId;
        },
        assets: {
            create: createAsset,
            getUrl: function (assetId: string) {
                return makeRequest<string>(`/assets/${assetId}/url`);
            },
        },
        grower: {
            get: function (): Promise<ServerGrower> {
                return makeRequest('/grower');
            },
        },
        growableTypes: {
            list: function (): Promise<ServerGrowableType[]> {
                return makeNonTenantedRequest('/growabletypes');
            },
        },
        growables: {
            list: function (): Promise<TotalList<ServerGrowable>> {
                return makeRequest<ServerGrowable[]>('/growables')
                    .then((growables) => growables.map(mapGrowable))
                    .then(getTotalList);
            },
            create: function (payload: ServerCreateGrowable) {
                return makeRequest<ServerGrowable>(
                    '/growables',
                    'POST',
                    payload,
                ).then(mapGrowable);
            },
            update: function (
                growableId: string,
                payload: ServerUpdateGrowable,
            ) {
                return makeRequest<ServerGrowable>(
                    `/growables/${growableId}`,
                    'PATCH',
                    payload,
                ).then(mapGrowable);
            },
            delete: function (growableId: string) {
                return makeRequest<void>(`/growables/${growableId}`, 'DELETE');
            },
        },
        observations: {
            list: function (growableId: string) {
                type FromServerObservation = Omit<
                    ServerObservation,
                    'recordedOn' | 'occurredOn' | 'createdOn'
                > & {
                    recordedOn: string;
                    occurredOn: string;
                    createdOn: string;
                };
                return makeRequest<FromServerObservation[]>(
                    `/observations/${growableId}`,
                )
                    .then((obs) => obs.map(mapObservation))
                    .then(getTotalList);
            },
            add: addObservation,
            addPhoto: async function (
                growableId: string,
                file: File,
                comments?: string,
            ) {
                const { url, assetId } = await makeRequest<{
                    url: string;
                    assetId: string;
                }>(`/assets`, 'POST');

                // upload directly to azure blobstorage via signed url
                await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                        'x-ms-blob-type': 'BlockBlob', // mystery undocumented header insisted on by azure blobstorage
                    },
                });

                // add observation data
                return addObservation(growableId, {
                    value: {
                        type: 'photographed',
                        data: {
                            assetId,
                        },
                    },
                    occurredOn: moment(file.lastModified), // TODO: get from exif even better but won't always exist anyway
                    comments,
                });
                // todo: if add observation fails, probably should remove asset from blobstorage
            },
            remove: async function (growableId: string, id: string) {
                return makeRequest(
                    `/observations/${growableId}/${id}`,
                    'DELETE',
                );
            },
        },
        user: {
            create: function (user: ServerAddUser) {
                return makeRequest<ServerUser>('/users', 'POST', user);
            },

            list: function (): Promise<TotalList<ServerUser>> {
                return makeRequest<ServerUser[]>('/users').then(getTotalList);
            },
            update: function (userId: string, user: ServerUpdateUser) {
                return makeRequest<ServerUser>(`/users/${userId}`, 'PUT', user);
            },
        },
        users: {
            bulkImport: function (users: ServerUpdateUser[]) {
                return makeRequest<{
                    users: ServerUser[];
                    fails: Array<{ user: ServerUser; error: string }>;
                }>('/users/bulkimport', 'POST', users);
            },
            clearLessonProgress: function (userIds: string[]) {
                return makeRequest<ServerUser[]>(
                    '/users/clearlessonprogress',
                    'POST',
                    {
                        userIds,
                    },
                );
            },
        },
        team: {
            list: function (): Promise<TotalList<ServerTeam>> {
                return makeRequest<ServerTeam[]>('/team').then(getTotalList);
            },
            create: function (team: CreateTeam) {
                return makeRequest<ServerTeam>('/team', 'POST', team);
            },
            update: function (team: UpdateTeam) {
                return makeRequest<ServerTeam>(`/team/${team.id}`, 'PUT', team);
            },
            delete: function (teamId: string) {
                return makeRequest(`/team/${teamId}`, 'DELETE');
            },
        },
        sensor: {
            list: function (): Promise<TotalList<ServerSensor>> {
                return makeRequest<ServerSensor[]>('/sensors').then(
                    getTotalList,
                );
            },
            assign: function (serial: string, details: ServerAssignSensor) {
                return makeRequest<void>(
                    `/admin/sensors/${serial}`,
                    'PUT',
                    details,
                );
            },
            replace: function (sourceSerial: string, targetSerial: string) {
                return makeRequest<void>('/admin/sensors', 'POST', {
                    method: 'migrate',
                    details: {
                        sourceSerial,
                        targetSerial,
                    },
                });
            },
            listAll: function (): Promise<TotalList<SuperUserSensor>> {
                return makeNonTenantedRequest<ServerSuperUserSensor[]>(
                    '/admin/sensor/list/all',
                )
                    .then((items) =>
                        items.map(
                            ({ readingStats, ...rest }): SuperUserSensor => ({
                                ...rest,
                                readingStats: readingStats
                                    ? {
                                          ...readingStats,
                                          first: readingStats.first
                                              ? moment(readingStats.first)
                                              : undefined,
                                          last: readingStats.last
                                              ? moment(readingStats.last)
                                              : undefined,
                                      }
                                    : undefined,
                            }),
                        ),
                    )
                    .then(getTotalList);
            },
            data: {
                list: function (
                    sensorId: string,
                    criteria: {
                        startDate?: moment.Moment;
                        endDate?: moment.Moment;
                        limit?: number;
                    } = {},
                ): Promise<{
                    sensor: { serial: string; name: string };
                    points: DataPoint[];
                }> {
                    return makeRequest<{
                        sensor: {
                            serial: string;
                            name: string;
                        };
                        dateRange: {
                            startDate: string;
                            endDate: string;
                        };
                        points: ServerDataPoint[];
                    }>(
                        `/sensors/${sensorId}/data?${toQueryString(criteria)}`,
                        'GET',
                    ).then(({ points, sensor, dateRange }) => ({
                        points: points.map(cleanDataPoint),
                        sensor,
                        dateRange,
                    }));
                },
                resetLiveData: function (serial: string) {
                    return makeRequest<void>(
                        `/sensors/${serial}/livedata`,
                        'DELETE',
                    );
                },
            },
        },
        organisation: {
            list: function (): Promise<TotalList<ServerOrganisation>> {
                return makeRequest<RawServerOrganisation[]>('/organisations')
                    .then((orgs) => orgs.map(mapOrganisation))
                    .then(getTotalList);
            },
            create: function (organisation: CreateOrganisation) {
                return makeRequest<RawServerOrganisation>(
                    '/organisations',
                    'POST',
                    organisation,
                ).then(mapOrganisation);
            },
            update: function (
                organisationId: string,
                update: UpdateOrganisation,
            ) {
                return makeRequest<RawServerOrganisation>(
                    `/organisations/${organisationId}`,
                    'PUT',
                    update,
                ).then(mapOrganisation);
            },
            delete: function (organisation: ServerOrganisation) {
                return makeRequest(
                    `/organisations/${organisation.id}`,
                    'DELETE',
                );
            },
            stats: function () {
                return makeRequest<ServerStatsEntry[]>('/organisations/stats');
            },
        },
        lesson: {
            list: function (): Promise<TotalList<ServerLesson>> {
                return makeNonTenantedRequest<ServerLesson[]>('/lessons').then(
                    getTotalList,
                );
            },
            start: function (id: string): Promise<void> {
                return makeRequest<void>(`/lessons/${id}`, 'PATCH', {
                    inProgress: true,
                });
            },
            stop: function (id: string): Promise<void> {
                return makeRequest<void>(`/lessons/${id}`, 'PATCH', {
                    inProgress: false,
                });
            },
            clearProgress: function (): Promise<void> {
                return makeRequest<void>(`/lessons`, 'DELETE');
            },
            completeSection: function (
                lessonId: string,
                sectionName: string,
            ): Promise<void> {
                return makeRequest<void>(
                    `/lessons/${lessonId}/sections/${sectionName}`,
                    'PUT',
                    {},
                );
            },
        },
    };
};

function getTotalList<T>(items: T[]): TotalList<T> {
    return { items, total: items.length };
}

const toQueryString = <T extends Record<string, any>>(obj: T) => {
    const items = [];
    for (const name in obj) {
        if (obj.hasOwnProperty(name)) {
            let value: any = obj[name];
            if (value instanceof Date || moment.isMoment(value)) {
                value = value.toISOString();
            } else {
                value = encodeURIComponent(value);
            }
            items.push(encodeURIComponent(name) + '=' + value);
        }
    }
    return items.join('&');
};
