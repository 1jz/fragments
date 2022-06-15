// tests/unit/app.test.js

const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../src/app');

describe('Generic app tests', () => {
    test('check 404 middleware', () => request(app).get('/404').expect(StatusCodes.NOT_FOUND));
});
