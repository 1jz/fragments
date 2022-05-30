// src/routes/api/get.js

const hsc = require('http-status-codes');
const { createSuccessResponse } = require('../../response');
/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
    // TODO: this is just a placeholder to get something working...
    res.status(hsc.StatusCodes.OK).json(
        createSuccessResponse({
            fragments: [],
        })
    );
};
