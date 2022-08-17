// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// GET /v1/fragments
router.use('/fragments', require('./get'));

// POST /v1/fragments
router.use('/fragments', require('./post'));

// DELETE /v1/fragments
router.use('/fragments', require('./delete'));

// PUT /v1/fragments
router.use('/fragments', require('./put'));

// Other routes will go here later on...

module.exports = router;
