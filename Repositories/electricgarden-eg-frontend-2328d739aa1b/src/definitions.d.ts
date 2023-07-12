declare type ExtractProps<
    T
> = T extends import('react-redux').InferableComponentEnhancerWithProps<
    infer TInjectedProps,
    infer TNeedsProps
>
    ? TInjectedProps
    : never;

type utils = typeof import('./utils');

interface User {
    id: string;
    name: string;
    email: string;
    date: number;
    role: import('./utils').Role;
    status: import('./utils').Status;
    teams: TeamItem[];
}

interface ServerUser {
    id: string;
    name: string;
    email: string;
    date: number;
    role: import('./utils').Role;
    status: import('./utils').Status;
    teams: TeamItem[];
}
interface ServerUpdateUser {
    name: string;
    email: string;
    role: import('./utils').Role;
    status: import('./utils').Status;
}

interface IdItem {
    id: string;
}

interface Team {
    id: string;
    name: string;
    date_created: number;
    users: IdItem[];
    sensors: IdItem[];
}
type ServerTeam = Team;

interface TeamItem {
    id: string;
    name: string;
}

interface ServerOrganisation {
    id: string;
    name: string;
    logo?: string;
    address: {
        line1: string;
        line2?: string;
        line3?: string;
        postcode: string;
        country: string;
    };
}
interface CreateOrganisation {
    name: string;
    address: {
        line1: string;
        line2: string;
        line3: string;
        postcode: string;
        country: string;
    };
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
}
interface ServerSuperUserSensor {
    _id: string;
    friendlyName: string;
    serial: string;
    organisationId?: string;
}
interface ServerUpdateSensor {
    name: string;
    serial: string;
    organisation?: string;
}

interface ServerDataPoint {
    id: string;
    timestamp: number;
    timestampSeconds: number;
    readings: {
        probe_soil_temp?: number;
        probe_air_temp?: number;
        probe_moisture?: number;
        ambient_humidity?: number;
        light_sensor?: number;
        battery_voltage?: number;
    };
}
interface DataPoint {
    timestamp: number;
    ambient_humidity: number | null;
    light_sensor: number | null;
    probe_air_temp: number | null;
    probe_moisture: number | null;
    probe_soil_temp: number | null;
    battery_voltage: number | null;
}

type Dict<T> = { [key: string]: T };

type TotalList<T> = { total: number; items: T[] };

type Success<T> = { success: boolean; value: T; error?: string | Error };
