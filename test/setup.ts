import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'
import React from 'react'

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    query: {},
    pathname: '/',
    route: '/',
    asPath: '/',
  }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props)
  },
}))

// Mock environment variables for tests
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

// Global test utilities
global.fetch = vi.fn()

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
})

// Mock ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: mockResizeObserver,
})
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: mockResizeObserver,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
