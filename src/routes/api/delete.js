const { createSuccessResponse } = require('../../response');
const { StatusCodes } = require('http-status-codes');
const express = require('express');

const { deleteFragment } = require('../../model/data');

// Create a router that we can use to mount our API
const router = express.Router();

router.delete('/:id', async (req, res, next) => {
    try {
        await deleteFragment(req.user, req.params.id);
        res.status(StatusCodes.OK).json(createSuccessResponse());
    } catch (error) {
        next(error);
    }
});

module.exports = router;
