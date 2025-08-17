import { devLog, prodError } from '@/lib/logger';

/**
 * Generate a short correlation ID for tracking requests
 */
export function generateCorrelationId(): string {
  return `co_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Sanitize data for logging (remove PII)
 */
export function sanitizeForLog(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = { ...data };
  
  // Sanitize email addresses
  if (sanitized.email && typeof sanitized.email === 'string') {
    const emailParts = sanitized.email.split('@');
    if (emailParts.length === 2) {
      const localPart = emailParts[0];
      const domainPart = emailParts[1];
      // Show first 2 and last 2 characters of local part
      if (localPart.length > 4) {
        sanitized.email = `${localPart.substring(0, 2)}***${localPart.substring(localPart.length - 2)}@${domainPart}`;
      } else {
        sanitized.email = `***@${domainPart}`;
      }
    }
  }
  
  // Sanitize nested customer data
  if (sanitized.customer && typeof sanitized.customer === 'object') {
    sanitized.customer = sanitizeForLog(sanitized.customer);
  }
  
  // Sanitize phone numbers
  if (sanitized.phone && typeof sanitized.phone === 'string') {
    const phone = sanitized.phone.replace(/\D/g, ''); // Remove non-digits
    if (phone.length >= 10) {
      sanitized.phone = `***-***-${phone.slice(-4)}`;
    } else {
      sanitized.phone = '***-***-****';
    }
  }
  
  // Sanitize credit card numbers (if any)
  if (sanitized.cardNumber) {
    sanitized.cardNumber = '****-****-****-****';
  }
  
  // Sanitize addresses partially
  if (sanitized.address1 && typeof sanitized.address1 === 'string') {
    // Keep first few characters and last few for debugging purposes
    if (sanitized.address1.length > 8) {
      sanitized.address1 = `${sanitized.address1.substring(0, 4)}***${sanitized.address1.slice(-4)}`;
    } else {
      sanitized.address1 = '***';
    }
  }
  
  return sanitized;
}

/**
 * Log checkout events with correlation ID and structured data
 */
export function logCheckoutEvent(
  event: string, 
  correlationId: string, 
  data: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: `CHECKOUT_${event.toUpperCase()}`,
    correlationId,
    environment: process.env.NODE_ENV,
    vercel: {
      deployment: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION,
    },
    ...sanitizeForLog(data)
  };
  
  // Use appropriate log level based on event type
  if (event.toLowerCase().includes('error') || event.toLowerCase().includes('failed')) {
    prodError(`CHECKOUT_${event.toUpperCase()}`, logEntry);
  } else {
    console.log(`CHECKOUT_${event.toUpperCase()}:`, JSON.stringify(logEntry, null, 2));
  }
}

/**
 * Log checkout timing information
 */
export function logCheckoutTiming(
  correlationId: string, 
  operation: string, 
  startTime: number,
  additionalData?: Record<string, unknown>
): void {
  const duration = Date.now() - startTime;
  
  logCheckoutEvent('timing', correlationId, {
    operation,
    duration_ms: duration,
    duration_readable: `${duration}ms`,
    ...additionalData
  });
}

/**
 * Create a performance timer for checkout operations
 */
export function createCheckoutTimer(correlationId: string, operation: string) {
  const startTime = Date.now();
  
  return {
    end: (additionalData?: Record<string, unknown>) => {
      logCheckoutTiming(correlationId, operation, startTime, additionalData);
    }
  };
}
