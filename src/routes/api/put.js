const { createSuccessResponse } = require('../../response');
const { StatusCodes } = require('http-status-codes');
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

// get fragments by ID
const getFragmentByID = async (req) => {
    try {
        let ownerId = req.user;
        let metadata = await Fragment.byId(ownerId, req.params.id);
        let data = await Fragment.prototype.getData.call(metadata);
        return { metadata, data };
    } catch (error) {
        error.status = StatusCodes.NOT_FOUND;
        throw error;
    }
};

// Create a router that we can use to mount our API
const router = express.Router();

router.put('/:id', rawBody(), async (req, res, next) => {
    let type = req.get('content-type');
    let ownerId = req.user;
    let id = req.params.id;
    let body = req.body;
    try {
        let fragment_old = await getFragmentByID(req);
        const fragment = new Fragment({
            id: id,
            ownerId: ownerId,
            type: type,
            created: fragment_old.metadata.created,
        });
        fragment.setData(body);
        fragment.save();
        res.status(StatusCodes.OK).json(
            createSuccessResponse({
                fragment: fragment.metadata,
            })
        );
    } catch (error) {
        next(error);
    }
});

module.exports = router;
