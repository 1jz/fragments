// tests/unit/response.test.js

const hsc = require('http-status-codes');
const { createErrorResponse, createSuccessResponse } = require('../../src/response');

// Define (i.e., name) the set of tests we're about to do
describe('API Responses', () => {
    // Write a test for calling createErrorResponse()
    test('createErrorResponse()', () => {
        const errorResponse = createErrorResponse(hsc.StatusCodes.NOT_FOUND, 'not found');
        // Expect the result to look like the following
        expect(errorResponse).toEqual({
            status: 'error',
            error: {
                code: hsc.StatusCodes.NOT_FOUND,
                message: 'not found',
            },
        });
    });

    // Write a test for calling createSuccessResponse() with no argument
    test('createSuccessResponse()', () => {
        // No arg passed
        const successResponse = createSuccessResponse();
        // Expect the result to look like the following
        expect(successResponse).toEqual({
            status: 'ok',
        });
    });

    // Write a test for calling createSuccessResponse() with an argument
    test('createSuccessResponse(data)', () => {
        // Data argument included
        const data = { a: 1, b: 2 };
        const successResponse = createSuccessResponse(data);
        // Expect the result to look like the following
        expect(successResponse).toEqual({
            status: 'ok',
            a: 1,
            b: 2,
        });
    });
});