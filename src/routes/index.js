// src/routes/index.js

const express = require('express');
const { StatusCodes } = require('http-status-codes');

// version and author from package.json
const { version, author } = require('../../package.json');

// creating responses
const { createSuccessResponse } = require('../response');

// Create a router that we can use to mount our API
const router = express.Router();

// Our authorization middleware
const { authenticate } = require('../authorization');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
    // Client's shouldn't cache this response (always request it fresh)
    res.setHeader('Cache-Control', 'no-cache');
    // Send a 200 'OK' response
    res.status(StatusCodes.OK).json(
        createSuccessResponse({
            author,
            githubUrl: 'https://github.com/1jz/fragments',
            version,
            dynamo: process.env.AWS_DYNAMODB_TABLE_NAME,
        })
    );
});

module.exports = router;
