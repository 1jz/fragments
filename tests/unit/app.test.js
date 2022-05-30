// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /404', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () => request(app).get('/404').expect(404));
});
