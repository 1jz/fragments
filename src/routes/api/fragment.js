// src/routes/api/fragment.js

const hsc = require('http-status-codes');
const { createSuccessResponse } = require('../../response');
const { createHash } = require('crypto');
const express = require('express');
const contentType = require('content-type');

const { Fragment } = require('../../model/fragment');

// Create a router that we can use to mount our API
const router = express.Router();

router.get('/', async (req, res) => {
    let ownerId = createHash('sha256').update(req.user).digest('hex');
    let frags = await Fragment.byUser(ownerId);
    res.status(hsc.StatusCodes.OK).json(
        createSuccessResponse({
            fragments: frags,
        })
    );
});

router.get('/:id', async (req, res) => {
    let ownerId = createHash('sha256').update(req.user).digest('hex');
    let frag = await Fragment.byId(ownerId, req.params.id);
    let data = await frag.getData();
    res.setHeader('content-type', frag.type);
    res.status(hsc.StatusCodes.OK).send(data);
});

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
    express.raw({
        inflate: true,
        limit: '5mb',
        type: (req) => {
            // See if we can parse this content type. If we can, `req.body` will be
            // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
            // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
            const { type } = contentType.parse(req);
            return Fragment.isSupportedType(type);
        },
    });

router.post('/', rawBody(), async (req, res) => {
    let type = req.get('content-type');
    let ownerId = createHash('sha256').update(req.user).digest('hex');
    let body = req.body;
    const fragment = new Fragment({ ownerId: ownerId, type: type });
    await fragment.save();
    await fragment.setData(body);
    res.status(hsc.StatusCodes.CREATED).json(
        createSuccessResponse({
            fragment,
        })
    );
});

module.exports = router;
