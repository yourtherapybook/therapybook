/**
 * Error handling utilities for the trainee application system
 */

export interface ApplicationError {
  code: string;
  message: string;
  field?: string;
  step?: number;
}

export class ApplicationValidationError extends Error {
  public errors: Record<string, string>;
  public step?: number;

  constructor(errors: Record<string, string>, step?: number) {
    super('Validation failed');
    this.name = 'ApplicationValidationError';
    this.errors = errors;
    this.step = step;
  }
}

export class ApplicationSubmissionError extends Error {
  public code: string;
  public retryable: boolean;

  constructor(message: string, code: string = 'SUBMISSION_FAILED', retryable: boolean = true) {
    super(message);
    this.name = 'ApplicationSubmissionError';
    this.code = code;
    this.retryable = retryable;
  }
}

export class ApplicationLoadError extends Error {
  public code: string;

  constructor(message: string, code: string = 'LOAD_FAILED') {
    super(message);
    this.name = 'ApplicationLoadError';
    this.code = code;
  }
}

// Error message mappings
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'You must be logged in to access this feature.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Validation errors
  VALIDATION_FAILED: 'Please correct the errors below and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_URL: 'Please enter a valid URL.',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size must be less than 5MB.',
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPG, PNG, or GIF).',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Application errors
  APPLICATION_NOT_FOUND: 'Application not found.',
  APPLICATION_ALREADY_SUBMITTED: 'This application has already been submitted.',
  SAVE_FAILED: 'Failed to save your progress. Please try again.',
  SUBMIT_FAILED: 'Failed to submit application. Please try again.',
  LOAD_FAILED: 'Failed to load application data.',
  
  // Server errors
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
} as const;

// Error handling utilities
export const handleApiError = (error: any): ApplicationError => {
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES.NETWORK_ERROR,
    };
  }

  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: ERROR_MESSAGES.UNAUTHORIZED,
        };
      case 404:
        return {
          code: 'APPLICATION_NOT_FOUND',
          message: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
        };
      case 422:
        return {
          code: 'VALIDATION_FAILED',
          message: ERROR_MESSAGES.VALIDATION_FAILED,
        };
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: ERROR_MESSAGES.SERVER_ERROR,
        };
      case 503:
        return {
          code: 'SERVICE_UNAVAILABLE',
          message: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred.',
        };
    }
  }

  // Handle custom application errors
  if (error instanceof ApplicationValidationError) {
    return {
      code: 'VALIDATION_FAILED',
      message: ERROR_MESSAGES.VALIDATION_FAILED,
    };
  }

  if (error instanceof ApplicationSubmissionError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof ApplicationLoadError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred.',
  };
};

// Retry logic for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors or non-retryable errors
      if (error instanceof ApplicationValidationError) {
        throw error;
      }
      
      if (error instanceof ApplicationSubmissionError && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Format validation errors for display
export const formatValidationErrors = (errors: Record<string, string>): string[] => {
  return Object.entries(errors).map(([field, message]) => {
    // Convert field names to human-readable format
    const fieldName = field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
    
    return `${fieldName}: ${message}`;
  });
};

// Check if error is retryable
export const isRetryableError = (error: any): boolean => {
  if (error instanceof ApplicationSubmissionError) {
    return error.retryable;
  }

  // Network errors are generally retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Server errors are retryable
  if (error.status >= 500) {
    return true;
  }

  // Validation errors are not retryable
  if (error instanceof ApplicationValidationError) {
    return false;
  }

  // Default to not retryable
  return false;
};

// Log errors for debugging
export const logError = (error: any, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorInfo);
  }

  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
};