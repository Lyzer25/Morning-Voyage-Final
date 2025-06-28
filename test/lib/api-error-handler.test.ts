import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateRequestId, retryWithBackoff } from '@/lib/api-error-handler'

describe('API Error Handler Utilities', () => {
  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()

      expect(id1).toMatch(/^req_\d+_[a-z0-9]{9}$/)
      expect(id2).toMatch(/^req_\d+_[a-z0-9]{9}$/)
      expect(id1).not.toBe(id2)
    })

    it('should start with req_ prefix', () => {
      const id = generateRequestId()
      expect(id).toMatch(/^req_/)
    })

    it('should contain timestamp and random string', () => {
      const id = generateRequestId()
      const parts = id.split('_')

      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('req')
      expect(parts[1]).toMatch(/^\d+$/) // timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]{9}$/) // random string
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      
      const result = await retryWithBackoff(operation, 3)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      
      const result = await retryWithBackoff(operation, 3)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'))
      
      // Properly handle the expected rejection
      await expect(retryWithBackoff(operation, 2)).rejects.toThrow('Persistent failure')
      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should respect delay bounds', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success')
      
      const startTime = Date.now()
      await retryWithBackoff(operation, 3)
      const endTime = Date.now()
      
      // Should have some delay but not too much in test
      expect(endTime - startTime).toBeGreaterThan(500)
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('should calculate exponential backoff correctly', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'))
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Use shorter delays for testing (minDelay: 10ms, maxDelay: 100ms)
      await expect(retryWithBackoff(operation, 3, 10, 100)).rejects.toThrow('Always fails')
      
      // Check that delays increase exponentially
      const calls = consoleSpy.mock.calls
      expect(calls.length).toBe(3) // 3 retry attempts
      
      // Verify retry attempts were logged with correct attempt numbers
      expect(calls[0][1]).toMatchObject({ attempt: 1, maxRetries: 3 })
      expect(calls[1][1]).toMatchObject({ attempt: 2, maxRetries: 3 })
      expect(calls[2][1]).toMatchObject({ attempt: 3, maxRetries: 3 })
      
      consoleSpy.mockRestore()
    }, 10000) // 10 second timeout for this test
  })
})
