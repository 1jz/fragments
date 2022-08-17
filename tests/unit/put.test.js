// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

const user = {
    name: 'user1@email.com',
    pass: 'password1',
};

describe('POST /v1/fragments', () => {
    // Using a valid username/password pair should allow us to create new fragments
    test('authenticated users can modify fragments', async () => {
        let data = 'data';
        const res = await request(app)
            .post('/v1/fragments')
            .auth(user.name, user.pass)
            .set('Content-Type', 'text/plain')
            .send(data);

        let fragment = await Fragment.byId(res.body.fragment.ownerId, res.body.fragment.id);

        let new_data = 'new_data';
        const res_new = await request(app)
            .put(`/v1/fragments/${fragment.id}`)
            .auth(user.name, user.pass)
            .set('Content-Type', 'text/plain')
            .send(new_data);

        expect(res_new.body.status).toBe('ok');
    });
});
