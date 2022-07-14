// src/routes/api/get.js

const { StatusCodes } = require('http-status-codes');
const { createSuccessResponse } = require('../../response');
const express = require('express');

const { Fragment, CONVERSION_LIST, EXTENSION_TYPE_LIST } = require('../../model/fragment');

// get fragments by ID
const getFragmentByID = async (req) => {
    try {
        let ownerId = req.user;
        let metadata = await Fragment.byId(ownerId, req.params.id);
        let data = await metadata.getData();
        return { metadata, data };
    } catch (error) {
        error.status = StatusCodes.NOT_FOUND;
        throw error;
    }
};

// get fragments by ID
const getFragmentMetadataByID = async (req) => {
    try {
        let ownerId = req.user;
        let metadata = await Fragment.byId(ownerId, req.params.id);
        return metadata;
    } catch (error) {
        error.status = StatusCodes.NOT_FOUND;
        throw error;
    }
};

// Create a router that we can use to mount our API
const router = express.Router();

router.get('/', async (req, res) => {
    let ownerId = req.user;
    let expand = req.query.expand === 'true' ? true : false;
    let frags = await Fragment.byUser(ownerId, expand);
    res.status(StatusCodes.OK).json(
        createSuccessResponse({
            fragments: frags,
        })
    );
});

router.get('/:id.:ext', async (req, res, next) => {
    try {
        let extension = req.params.ext;
        let fragment = await getFragmentByID(req);
        let list = CONVERSION_LIST[fragment.metadata.type];
        let data = fragment.data;
        if (list && list.includes(extension)) {
            if (extension === 'html' && fragment.metadata.type === 'text/markdown') {
                let md = require('markdown-it')();
                data = md.render(data.toString());
            }
            res.setHeader('Content-Type', EXTENSION_TYPE_LIST[extension]);
            res.status(StatusCodes.OK).send(data);
        } else {
            let err = new Error(`Fragment cannot be converted to ${extension}`);
            err.status = StatusCodes.UNSUPPORTED_MEDIA_TYPE;
            throw err;
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        let fragment = await getFragmentByID(req);
        res.setHeader('Content-Type', fragment.metadata.type);
        res.status(StatusCodes.OK).send(fragment.data);
    } catch (error) {
        next(error);
    }
});

router.get('/:id/info', async (req, res, next) => {
    try {
        let metadata = await getFragmentMetadataByID(req);
        res.setHeader('Content-Type', 'application/json');
        res.status(StatusCodes.OK).send(metadata);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
