// src/model/data/index.js

const logger = require('../../logger');

// If the environment sets an AWS Region, we'll use AWS backend
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
process.env.AWS_REGION
    ? logger.info(`Using AWS services ${process.env.AWS_REGION}`)
    : logger.info('Using in-memory services');
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
