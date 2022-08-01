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

describe('DELETE /v1/fragments', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () =>
        request(app).delete('/v1/fragments').expect(StatusCodes.UNAUTHORIZED));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
        request(app)
            .delete('/v1/fragments')
            .auth('invalid@email.com', 'incorrect_password')
            .expect(StatusCodes.UNAUTHORIZED));

    // Using a valid username/password pair should give a success result with a .fragments array
    test('authenticated users can delete their fragments array', async () => {
        let fragment = new Fragment({
            ownerId: hash(user.name),
            type: 'application/json',
            size: 0,
        });

        await fragment.save();
        await fragment.setData(`{"test":123}`);

        const res = await request(app)
            .delete(`/v1/fragments/${fragment.id}`)
            .auth(user.name, user.pass);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.status).toBe('ok');
    });
});
