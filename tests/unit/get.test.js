// tests/unit/get.test.js

const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

const user = {
    name: 'user1@email.com',
    pass: 'password1',
};

describe('GET /v1/fragments', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
        request(app).get('/v1/fragments').expect(StatusCodes.UNAUTHORIZED));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
        request(app)
            .get('/v1/fragments')
            .auth('invalid@email.com', 'incorrect_password')
            .expect(StatusCodes.UNAUTHORIZED));

    // Using a valid username/password pair should give a success result with a .fragments array
    test('authenticated users get a fragments array', async () => {
        const res = await request(app).get('/v1/fragments').auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.status).toBe('ok');
        expect(Array.isArray(res.body.fragments)).toBe(true);
    });

    // Test if user's fragments are returned.
    test('authenticated users get their fragments', async () => {
        let fragment = new Fragment({ ownerId: hash(user.name), type: 'text/plain', size: 0 });
        await fragment.save();
        await fragment.setData('data');
        const res = await request(app).get('/v1/fragments').auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.status).toBe('ok');
        expect(Array.isArray(res.body.fragments)).toBe(true);
        expect(res.body.fragments.includes(fragment.id)).toBe(true);
    });

    // Test if fragment data can be expanded.
    test('authenticated users get their fragments', async () => {
        const res = await request(app)
            .get('/v1/fragments')
            .query({ expand: true })
            .auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.status).toBe('ok');
        expect(Array.isArray(res.body.fragments)).toBe(true);
        expect('ownerId' in res.body.fragments[0]).toBe(true); // check if field from non-expanded list is included, more is redundant
    });

    // Test if user's fragments are returned.
    test('get fragment text data from ID', async () => {
        let fragment = new Fragment({ ownerId: hash(user.name), type: 'text/plain', size: 0 });
        await fragment.save();
        await fragment.setData('data');
        const res = await request(app)
            .get(`/v1/fragments/${fragment.id}`)
            .auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.text).toBe('data');
    });

    // Test if user's fragments are returned.
    test('test error handler for false IDs', async () => {
        const res = await request(app).get(`/v1/fragments/falseId`).auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
});
