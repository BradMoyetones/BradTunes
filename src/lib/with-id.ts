import crypto from 'node:crypto';

export function withId<T extends object>(data: T): T & { id: string } {
    return {
        ...data,
        id: crypto.randomUUID(),
    };
}
