// src/services/logger.service.ts
// This service provides a centralized Winston logger instance.
import {
  BindingScope,
  injectable
} from '@loopback/core';
import {
  createLogger,
  format,
  Logger,
  transports
} from 'winston';

// You would typically define log levels in your environment variables.
const logLevel = process.env.LOG_LEVEL || 'info';

@injectable({
  scope: BindingScope.SINGLETON
})
export class LoggerService {
  public logger: Logger;

  constructor() {
    this.logger = createLogger({
      // Set the log level from environment variables.
      // Logs with a level below this will be ignored.
      level: logLevel,
      // Use a combined format for better log messages.
      format: format.combine(
        // This format adds the timestamp to each log message.
        format.timestamp(),
        // This format helps to capture the full stack trace for errors.
        format.errors({
          stack: true
        }),
        // This is the most important part for Kubernetes: it outputs logs in JSON.
        // JSON format is easy to parse by log collectors.
        format.json(),
      ),
      // The transports define where the logs will be sent.
      // In this case, we send all logs to the console.
      transports: [
        new transports.Console(),
      ],
      // We also handle unhandled exceptions here to prevent the application from crashing.
      exceptionHandlers: [
        new transports.Console()
      ],
      // We can also handle uncaught promise rejections.
      rejectionHandlers: [
        new transports.Console()
      ]
    });
    // This allows LoopBack to use the logger in controllers, services, etc.
    this.logger.info('Logger service initialized successfully.');
  }
}
