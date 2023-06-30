/**
 * A custom error class for application errors.
 */
class AppError extends Error {
	statusCode: number;
	status: string;
	isOperational: boolean;

	/**
	 * Constructs a new instance of the AppError class.
	 *
	 * @param {string} message - The error message.
	 * @param {string} statusCode - The HTTP status code for the error.
	 */
	constructor(message: string, statusCode: number, error?: Error) {
		super(message);

		// The HTTP status code for the error
		this.statusCode = statusCode;

		// The status of the error (either 'fail' or 'error')
		// If the status code is 4xx, the status is 'fail'
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

		// Indicates whether the error is operational or not.
		// If true, this error can send to the client side
		this.isOperational = true;

		this.stack = JSON.stringify(error, ['stack']);

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
