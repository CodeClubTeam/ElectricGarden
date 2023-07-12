import { ValueType } from 'react-select/lib/types';
import { uniq, isArray } from 'lodash';

export function getArray<T>(value: ValueType<T>): T[] {
    if (!value) {
        return [];
    }
    if (isArray(value)) {
        return value;
    }
    return [value] as T[];
}

export function getSingle<T>(value: ValueType<T>): T | undefined {
    if (!value) {
        return;
    }
    if (isArray(value)) {
        return value[0];
    }
    return value as T;
}

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
    member = 'member',
    leader = 'leader',
    admin = 'admin',
    su = 'su',
}
export enum RoleIndex {
    member = 0,
    leader = 1,
    admin = 2,
    su = 3,
}
export const roleOptions = [{ value: Role.member, label: Role.member }];
export enum Status {
    invited = 'invited',
    active = 'active',
    deactivated = 'deactivated',
}
