import { NextResponse } from 'next/server'

export interface ApiError {
  code: string
  message: string
  statusCode: number
  context?: Record<string, any>
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class ApiErrorHandler {
  private static logError(error: ApiError): void {
    const logEntry = {
      timestamp: error.timestamp,
      severity: error.severity,
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.context?.stack,
    }

    // Log based on severity
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('🚨 API Error:', logEntry)
    } else if (error.severity === 'medium') {
      console.warn('⚠️ API Warning:', logEntry)
    } else {
      console.log('ℹ️ API Info:', logEntry)
    }

    // In production, you might want to send critical errors to monitoring service
    if (process.env.NODE_ENV === 'production' && error.severity === 'critical') {
      // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoring(logEntry)
    }
  }

  private static getUserFriendlyMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      PRODUCTS_FETCH_FAILED: 'Unable to load products. Please try again later.',
      SHEETS_SYNC_FAILED: 'Product sync temporarily unavailable. Showing cached data.',
      WEBHOOK_UNAUTHORIZED: 'Access denied.',
      WEBHOOK_PROCESSING_FAILED: 'Webhook processing failed.',
      NETWORK_ERROR: 'Connection issue. Please check your internet and try again.',
      RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
      VALIDATION_ERROR: 'Invalid request data.',
      UNKNOWN_ERROR: 'Something went wrong. Please try again later.',
    }

    return messages[errorCode] || messages['UNKNOWN_ERROR']
  }

  public static handleError(
    error: unknown,
    context: {
      operation: string
      endpoint: string
      userId?: string
      requestId?: string
      additionalContext?: Record<string, any>
    }
  ): NextResponse {
    const timestamp = new Date().toISOString()
    let apiError: ApiError

    // Categorize and handle different error types
    if (error instanceof Error) {
      // Network/API errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        apiError = {
          code: 'NETWORK_ERROR',
          message: error.message,
          statusCode: 503,
          severity: 'high',
          timestamp,
          context: {
            ...context,
            stack: error.stack,
            originalError: error.message,
          },
        }
      }
      // Rate limiting errors
      else if (error.message.includes('rate') || error.message.includes('limit')) {
        apiError = {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message,
          statusCode: 429,
          severity: 'medium',
          timestamp,
          context: {
            ...context,
            stack: error.stack,
            originalError: error.message,
          },
        }
      }
      // Authentication/Authorization errors
      else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        apiError = {
          code: 'WEBHOOK_UNAUTHORIZED',
          message: error.message,
          statusCode: 401,
          severity: 'medium',
          timestamp,
          context: {
            ...context,
            stack: error.stack,
            originalError: error.message,
          },
        }
      }
      // Validation errors
      else if (error.message.includes('validation') || error.message.includes('invalid')) {
        apiError = {
          code: 'VALIDATION_ERROR',
          message: error.message,
          statusCode: 400,
          severity: 'low',
          timestamp,
          context: {
            ...context,
            stack: error.stack,
            originalError: error.message,
          },
        }
      }
      // Generic errors
      else {
        apiError = {
          code: 'UNKNOWN_ERROR',
          message: error.message,
          statusCode: 500,
          severity: 'high',
          timestamp,
          context: {
            ...context,
            stack: error.stack,
            originalError: error.message,
          },
        }
      }
    } else {
      // Handle non-Error objects
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
        severity: 'high',
        timestamp,
        context: {
          ...context,
          originalError: String(error),
        },
      }
    }

    // Log the error
    this.logError(apiError)

    // Return user-friendly response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: apiError.code,
          message: this.getUserFriendlyMessage(apiError.code),
        },
        timestamp: apiError.timestamp,
        requestId: context.requestId,
        // Only include debug info in development
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            originalMessage: apiError.message,
            context: apiError.context,
          },
        }),
      },
      { status: apiError.statusCode }
    )
  }

  public static handleSuccess<T>(
    data: T,
    context: {
      operation: string
      endpoint: string
      userId?: string
      requestId?: string
    }
  ): NextResponse {
    const timestamp = new Date().toISOString()

    // Log successful operations for monitoring
    console.log(`✅ API Success: ${context.operation}`, {
      endpoint: context.endpoint,
      userId: context.userId,
      requestId: context.requestId,
      timestamp,
    })

    return NextResponse.json({
      success: true,
      data,
      timestamp,
      requestId: context.requestId,
    })
  }
}

// Utility function to generate request IDs for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility function for retry logic with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay)

      console.warn(`⚠️ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, {
        error: lastError.message,
        attempt: attempt + 1,
        maxRetries,
        delay,
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
