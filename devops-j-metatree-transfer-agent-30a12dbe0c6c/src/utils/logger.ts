import winston, { Logger } from 'winston';

enum LogLevel {
	Error = 'error',
	Warn = 'warn',
	Info = 'info',
	Debug = 'debug'
}

export const logger: Logger = winston.createLogger({
	level: process.env.LOGGER_LEVEL || LogLevel.Info,
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.printf(info => `${info.timestamp} ${info.level} ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'combined.log' })
	]
});
