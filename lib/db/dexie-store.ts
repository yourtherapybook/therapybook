import Dexie, { type Table } from 'dexie';

export interface OfflineSession {
    id?: number;
    therapistId: string;
    date: string;
    status: 'pending' | 'confirmed';
}

export interface ConsentState {
    id?: number;
    accepted: boolean;
    timestamp: string;
}

export class TherapyStore extends Dexie {
    sessions!: Table<OfflineSession>;
    consent!: Table<ConsentState>;

    constructor() {
        super('therapybook-db');
        this.version(1).stores({
            sessions: '++id, therapistId, date, status',
            consent: '++id, accepted, timestamp'
        });
    }
}

export const db = new TherapyStore();
