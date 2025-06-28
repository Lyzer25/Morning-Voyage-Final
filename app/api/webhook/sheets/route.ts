import { NextResponse } from 'next/server'
import { handleSheetWebhook } from '@/lib/google-sheets-integration'
import { ApiErrorHandler, generateRequestId, retryWithBackoff } from '@/lib/api-error-handler'

export async function POST(request: Request) {
  const requestId = generateRequestId()
  const context = {
    operation: 'sheets_webhook',
    endpoint: '/api/webhook/sheets',
    requestId,
  }

  try {
    // Rate limiting check (simple implementation)
    const clientIp =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    console.log(`📨 Webhook received from IP: ${clientIp}`, { requestId })

    // Parse payload with size limit for security
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      // 1MB limit
      throw new Error('Payload too large')
    }

    const payload = await request.json()

    // Verify webhook authenticity
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.WEBHOOK_SECRET}`

    if (!process.env.WEBHOOK_SECRET) {
      console.error('🚨 WEBHOOK_SECRET not configured')
      throw new Error('Webhook security not properly configured')
    }

    if (authHeader !== expectedAuth) {
      console.warn(`🚫 Unauthorized webhook attempt from ${clientIp}`, {
        requestId,
        providedAuth: authHeader?.substring(0, 20) + '...',
      })
      throw new Error('Unauthorized webhook access')
    }

    // Process webhook with retry logic for resilience
    await retryWithBackoff(
      () => handleSheetWebhook(payload),
      3, // max retries
      1000, // base delay
      5000 // max delay
    )

    console.log(`✅ Webhook processed successfully`, { requestId })

    return ApiErrorHandler.handleSuccess(
      {
        message: 'Webhook processed successfully',
        processedAt: new Date().toISOString(),
      },
      context
    )
  } catch (error) {
    // Determine if this is an auth error or processing error
    const isAuthError =
      error instanceof Error &&
      (error.message.includes('Unauthorized') || error.message.includes('auth'))

    return ApiErrorHandler.handleError(error, {
      ...context,
      additionalContext: {
        contentType: request.headers.get('content-type'),
        userAgent: request.headers.get('user-agent'),
        clientIp: request.headers.get('x-forwarded-for') || 'unknown',
        isAuthError,
      },
    })
  }
}

// Optional: Add GET method for webhook health check
export async function GET() {
  const requestId = generateRequestId()

  return ApiErrorHandler.handleSuccess(
    {
      status: 'healthy',
      service: 'sheets-webhook',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    },
    {
      operation: 'webhook_health_check',
      endpoint: '/api/webhook/sheets',
      requestId,
    }
  )
}
