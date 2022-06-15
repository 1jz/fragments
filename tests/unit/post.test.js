// tests/unit/post.test.js

const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

const user = {
    name: 'user1@email.com',
    pass: 'password1',
};

describe('POST /v1/fragments', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
        request(app).post('/v1/fragments').expect(StatusCodes.UNAUTHORIZED));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
        request(app)
            .post('/v1/fragments')
            .auth('invalid@email.com', 'incorrect_password')
            .expect(StatusCodes.UNAUTHORIZED));

    // Using a valid username/password pair should allow us to create new fragments
    test('authenticated users can add plain text fragments', async () => {
        let data = 'data';
        const res = await request(app)
            .post('/v1/fragments')
            .auth(user.name, user.pass)
            .set('Content-Type', 'text/plain')
            .send(data);

        let fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);

        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(res.body.status).toBe('ok');
        expect(fragment.ownerId).toBe(hash(user.name));
        expect(fragment.size).toBe(data.length);
    });

    // test error handler by leaving out content-type
    test('test error handler for bad requests', async () => {
        let res = await request(app).post('/v1/fragments').auth(user.name, user.pass).send('data');
        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.status).toBe('error');
    });
});
