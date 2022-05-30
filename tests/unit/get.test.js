// tests/unit/get.test.js

const request = require('supertest');
const hsc = require('http-status-codes');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
        request(app).get('/v1/fragments').expect(hsc.StatusCodes.UNAUTHORIZED));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
        request(app)
            .get('/v1/fragments')
            .auth('invalid@email.com', 'incorrect_password')
            .expect(hsc.StatusCodes.UNAUTHORIZED));

    // Using a valid username/password pair should give a success result with a .fragments array
    test('authenticated users get a fragments array', async () => {
        const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
        expect(res.statusCode).toBe(hsc.StatusCodes.OK);
        expect(res.body.status).toBe('ok');
        expect(Array.isArray(res.body.fragments)).toBe(true);
    });

    // TODO: we'll need to add tests to check the contents of the fragments array later
});
