// tests/unit/app.test.js

const request = require('supertest');
const hsc = require('http-status-codes');

const app = require('../../src/app');

describe('GET /404', () => {
    test('check 404 middleware', () => request(app).get('/404').expect(hsc.StatusCodes.NOT_FOUND));
});
