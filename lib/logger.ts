export const isDev = process.env.NODE_ENV === 'development';
export const isVercel = !!process.env.VERCEL_ENV;

/**
 * Log helper used for development-only debug output.
 * Usage: devLog('message', optionalData)
 */
export function devLog(message: string, data?: any) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(message, data);
  }
}

/**
 * Log an error that should appear in production logs.
 * Use this for real errors that need operator attention.
 */
export function prodError(message: string, error?: any) {
  // Always print errors so we don't miss critical failures in production
  // eslint-disable-next-line no-console
  console.error(message, error);
}

/**
 * Build-time log helper: enabled during development or when running on Vercel.
 * Useful for showing a single marker during build previews while remaining quiet for local production builds.
 */
export function buildLog(message: string, data?: any) {
  if (isDev || isVercel) {
    // eslint-disable-next-line no-console
    console.log(message, data);
  }
}
