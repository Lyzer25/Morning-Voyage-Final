export async function logAuditEvent(event: string, userId: string | null, data: any): Promise<void> {
  // Minimal placeholder audit logging that can be expanded later.
  console.log(`AUDIT: ${event}`, { userId, data, timestamp: new Date().toISOString() });
}

export async function logError(error: string, correlationId: string | null = null, details: any = {}): Promise<void> {
  console.error(`ERROR: ${error}`, { correlationId, details, timestamp: new Date().toISOString() });
}
