// tests/unit/app.test.js

const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../src/app');

const user = {
    name: 'user1@email.com',
    pass: 'password1',
};

describe('Generic app tests', () => {
    test('check 404 middleware', () => request(app).get('/404').expect(StatusCodes.NOT_FOUND));

    // meh
    test('check error handler middleware', async () => {
        let res = await request(app).post('/v1/fragments').auth(user.name, user.pass).send('data');
        expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(res.body.status).toBe('error');
    });
});
