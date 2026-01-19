import { InMemoryDbService } from 'angular-in-memory-web-api';

export class FakeBackendService implements InMemoryDbService {
    createDb() {
        return {
            users: [
                { id: 1, username: 'user', password: '1234', role: 'admin' },
                { id: 2, username: 'guest', password: 'guest', role: 'viewer' }
            ]
        };
    }
}
