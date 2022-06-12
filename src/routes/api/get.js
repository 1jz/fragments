// src/routes/api/get.js

const { StatusCodes } = require('http-status-codes');
const { createSuccessResponse } = require('../../response');
const express = require('express');

const { Fragment } = require('../../model/fragment');

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

router.get('/:id', async (req, res) => {
    let ownerId = req.user;
    let frag = await Fragment.byId(ownerId, req.params.id);
    let data = await frag.getData();
    res.setHeader('content-type', frag.type);
    res.status(StatusCodes.OK).send(data);
});

module.exports = router;
