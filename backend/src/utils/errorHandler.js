/**
 * Custom Error Handler Class
 * Provides consistent error handling throughout the application
 */
export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Handler to wrap controller methods
 * Automatically handles promise rejections and passes them to error middleware
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
