export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    message: string,
    code: string,
    statusCode = 500,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in to continue.", options?: { cause?: unknown }) {
    super(message, "UNAUTHORIZED", 401, options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You cannot access this resource.") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "This item could not be found.") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "The submitted data is invalid.") {
    super(message, "VALIDATION", 400);
  }
}

export class DiscogsError extends AppError {
  constructor(message = "Discogs is unavailable right now.", options?: { cause?: unknown }) {
    super(message, "DISCOGS", 502, options);
  }
}

export class DeezerError extends AppError {
  constructor(message = "Deezer could not play a sample just now.", options?: { cause?: unknown }) {
    super(message, "DEEZER", 502, options);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "The collection could not be saved.", options?: { cause?: unknown }) {
    super(message, "DATABASE", 500, options);
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
