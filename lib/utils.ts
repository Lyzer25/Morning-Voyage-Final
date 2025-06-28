import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with proper currency display
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice)
}

// Format price without currency symbol (for calculations)
export function formatPriceNumber(price: number | string): string {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price

  if (isNaN(numPrice)) {
    return '0.00'
  }

  return numPrice.toFixed(2)
}

// Calculate savings amount
export function calculateSavings(originalPrice: number, currentPrice: number): string {
  const savings = originalPrice - currentPrice
  return formatPrice(savings)
}

// Calculate savings percentage
export function calculateSavingsPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0
  const savings = originalPrice - currentPrice
  return Math.round((savings / originalPrice) * 100)
}
