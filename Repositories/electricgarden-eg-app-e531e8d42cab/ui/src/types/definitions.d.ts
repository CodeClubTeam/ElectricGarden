declare type ExtractProps<
    T
> = T extends import('react-redux').InferableComponentEnhancerWithProps<
    infer TInjectedProps,
    infer TNeedsProps
>
    ? TInjectedProps
    : never;

type utils = typeof import('../utils');

type Theme = typeof import('../theme').theme;

type DateRange = {
    startDate: import('moment').Moment;
    endDate: import('moment').Moment;
};

type NullableDateRange = Nullable<DateRange>;

type ServerGrower = ServerUser & {
    organisation: Pick<ServerOrganisation, 'id' | 'name' | 'mode'>;
    teams: Array<Pick<ServerTeam, 'id' | 'name'>>;
};

interface ServerGrowable {
    id: string;
    title: string;
    teamId: string;
    sensorId: string;
    type: ServerGrowableType;
    notes?: string;
    soilType?: string;
    createdOn: Date;
}

interface ServerGrowableType {
    id: string;
    name: string;
    title: string;
    observables: string[];
}

interface ServerCreateGrowable
    extends Omit<ServerGrowable, 'id' | 'type' | 'createdOn'> {
    typeId: string;
}
interface ServerUpdateGrowable
    extends Partial<Omit<ServerGrowable, 'id' | 'type' | 'createdOn'>> {}

interface ServerObservation<
    TValue extends import('../pages/Garden/types').ObservationValue = import('../pages/Garden/types').ObservationValue
> {
    id: string;
    value: TValue;
    recordedBy: { name: string };
    recordedOn: Date;
    occurredOn: Date;
    comments?: string;
    createdOn: Date;
}

interface ServerCreateObservation<
    TValue extends import('../pages/Garden/types').ObservationValue = import('../pages/Garden/types').ObservationValue
> extends Pick<ServerObservation<TValue>, 'value' | 'comments'> {
    occurredOn: import('moment').Moment;
}

interface ServerUser {
    id: string;
    name: string;
    email: string;
    createdOn: Date;
    role: import('../utils').Role;
    status: import('../utils').Status;
    learnerLevel: number;
    lessonCounts: {
        inProgress: number;
        completed: number;
    };
    // teams: TeamItem[];
}
interface ServerUpdateUser {
    name: string;
    email: string;
    learnerLevel: number;
    role: import('../utils').Role;
    status: import('../utils').Status;
}
interface ServerAddUser extends ServerUpdateUser {
    firstAdmin?: boolean;
}

interface TeamMembership {
    userId: string;
    role: 'member' | 'leader';
}

interface Team {
    id: string;
    name: string;
    createdOn: Date;
    memberships: TeamMembership[];
}
type ServerTeam = Team;

type CreateTeam = Pick<ServerTeam, 'name' | 'memberships'>;

type UpdateTeam = Pick<ServerTeam, 'id' | 'name' | 'memberships'>;

interface Address {
    line1?: string;
    line2?: string;
    line3?: string;
    city?: string;
    postcode: string;
    country: string;
}
interface ServerOrganisation {
    id: string;
    name: string;
    logo?: string;
    address: Address;
    createdOn: Date;
    defaultTeamId?: string;
    mode?: OrgMode;
}
interface CreateOrganisation {
    name: string;
    address: Address;
    mode?: OrgMode;
}
interface UpdateOrganisation {
    name: string;
    address: Address;
    defaultTeamId?: string;
    mode?: OrgMode;
}

interface Tag {
    value: string;
    label: string;
}

type Sensor = ServerSensor;
interface ServerSensor {
    id: string;
    name: string;
    serial: string;
    organisationId?: string;
    readingStats?: SuperUserSensor['readingStats'];
}
interface ServerSuperUserSensor {
    id: string;
    serial: string;
    friendlyName: string;
    organisationId?: string;
    readingStats?: {
        first: string;
        last: string;
        count: number;
    };
}

interface SuperUserSensor extends ServerSuperUserSensor {
    readingStats?: {
        first?: import('moment').Moment;
        last?: import('moment').Moment;
        count: number;
    };
}

interface Instantiated {
    date: string;
    machine: string;
    user: string;
    invocation: string;
}

interface ServerUpdateSensor {
    name: string;
    serial: string;
    organisation?: string;
}

interface ServerAssignSensor {
    name: string;
    organisationId: string;
    purgeReadings: boolean;
}

interface DataPointReadings {
    probe_soil_temp: number;
    probe_air_temp: number;
    probe_moisture: number;
    ambient_humidity: number;
    light_sensor: number;
    battery_voltage: number;
    rssi: number;
    snr: number;
    co2: number;
}

interface DataPointDerivedReadings {
    batteryPercent: number;
}

interface ServerDataPoint {
    timestamp: string;
    readings: Partial<DataPointReadings>;
}

type NullableObj<T> = {
    [P in keyof T]: T[P] | null;
};

type DataPoint = NullableObj<DataPointReadings & DataPointDerivedReadings> & {
    timestamp: Date;
};

interface ServerLesson {
    id: string;
    title: string;
    level: number;
    sections: ServerLessonSection[];
    contentPath: string;
    seasons: string[];
    categories: string[];
    status?: LessonStatus;
    locked?: boolean;
}

interface ServerLessonSection {
    name: string;
    title: string;
    completed: boolean;
}

type LessonStatus = 'in progress' | 'completed' | 'locked';

type Dict<T> = { [key: string]: T };

type TotalList<T> = { total: number; items: T[] };

type Success<T> = { success: boolean; value: T; error?: string | Error };

type Entity = { id: string };

type FetchState = {
    fetching?: boolean;
    fetched?: boolean;
};
type Fetchable<TEntity extends {}> = {
    itemsByKey: Dict<TEntity>;
} & FetchState;

interface ServerStatsEntry {
    id: string;
    name: string;
    createdOn: Date;
    address: string;
    userCount: number;
    userDeactivatedCount: number;
    userInvitedCount: number;
    userActiveCount: number;
    deviceCount: number;
    deviceSamples: number;
    deviceFirstSample: Date | null;
    deviceLastSample: Date | null;
    loginCount: number;
    lastLogin: Date | null;
    firstLogin: Date | null;
    lessonsInProgress: number;
    lessonsCompleted: number;
    teamsCount: number;
    growablesCount: number;
}
