import { logToCloudWatch } from "./cloudwatchLogger";

export type LogLevel = "INFO" | "ERROR" | "WARN" | "SUCCESS";

export type LogContext = {
  userId?: string;
  sessionId?: string;
  routeName?: string;
  [key: string]: unknown;
};

function formatError(err: unknown) {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
    };
  }
  return {
    message: typeof err === "string" ? err : JSON.stringify(err),
  };
}

class Logger {
  private baseContext: LogContext;

  constructor(context?: LogContext) {
    this.baseContext = context || {};
  }

  withContext(context: LogContext) {
    return new Logger({ ...this.baseContext, ...context });
  }

  info(message: string, context?: LogContext) {
    this.send("INFO", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.send("WARN", message, context);
  }

  success(message: string, context?: LogContext) {
    this.send("SUCCESS", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    const errorDetails = error ? formatError(error) : undefined;
    this.send("ERROR", message, context, errorDetails);
  }

  private async send(
    level: LogLevel,
    message: string,
    context?: LogContext,
    errorDetails?: object
  ) {
    const mergedContext = { ...this.baseContext, ...context };

    const route = mergedContext.routeName || "unknown";
    const sessionId = mergedContext.sessionId || "anonymous";
    const userId = mergedContext.userId || "guest";

    const logObject = {
      level,
      message,
      ...(errorDetails ? { error: errorDetails } : {}),
    };

    try {
      await logToCloudWatch(JSON.stringify(logObject), route, userId, sessionId);
    } catch (err) {
      console.error("Failed to log to CloudWatch", err);
    }
  }
}

export const logger = new Logger();
