import { uniq } from 'lodash-es';
import moment from 'moment';

export function thingToOption(thing: { id: string; name: string }) {
    return { value: thing.id, label: thing.name };
}

export function randomAmount<T>(max: number, creator: () => T): T[] {
    let length = Math.floor(Math.random() * max + 1);
    let output = [];
    for (let i = 0; i < length; i++) {
        output.push(creator());
    }
    return uniq(output);
}

export enum Role {
    kiosk = 'kiosk',
    member = 'member',
    leader = 'leader',
    admin = 'admin',
    su = 'su',
}

export enum RoleIndex {
    kiosk = 0,
    member = 1,
    leader = 2,
    admin = 3,
    su = 4,
}

export const roleOptions = [{ value: Role.member, label: Role.member }];

export enum Status {
    invited = 'invited',
    active = 'active',
    deactivated = 'deactivated',
}

export enum OrgMode {
    standard = 'standard',
    kiosk = 'kiosk',
}

export const orgModes: OrgMode[] = [OrgMode.standard, OrgMode.kiosk];

export const formatDateTime = (value: string | Date) =>
    moment(value).format('HH:mm DD-M-YYYY');

export const formatFriendlyDateTime = (value: string | Date) =>
    moment(value).fromNow();

export const formatDate = (value: string | Date) =>
    moment(value).format('DD-MMM-YYYY');

export const roleIncludesRole = (role: Role, targetRole: Role): boolean => {
    const targetRoleNumber = RoleIndex[targetRole];
    const roleNumber = RoleIndex[role];
    return roleNumber >= targetRoleNumber;
};
