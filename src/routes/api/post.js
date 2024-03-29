// src/routes/api/post.js

const { StatusCodes } = require('http-status-codes');
const { createSuccessResponse } = require('../../response');
const express = require('express');
const contentType = require('content-type');

const { Fragment } = require('../../model/fragment');

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

// Create a router that we can use to mount our API
const router = express.Router();

router.post('/', rawBody(), async (req, res, next) => {
    let type = req.get('content-type');
    let ownerId = req.user;
    let body = req.body;
    try {
        const fragment = new Fragment({ ownerId: ownerId, type: type });
        await fragment.setData(body);
        await fragment.save();
        res.location(`http://${req.get('host')}${req.originalUrl}/${fragment.id}`);
        res.status(StatusCodes.CREATED).json(
            createSuccessResponse({
                fragment,
            })
        );
    } catch (error) {
        if (error.message === 'unsupported type') error.status = StatusCodes.UNSUPPORTED_MEDIA_TYPE;
        else error.status = StatusCodes.BAD_REQUEST;
        next(error);
    }
});

module.exports = router;
