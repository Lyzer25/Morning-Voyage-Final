import { describe, it, expect } from 'vitest'
import { generateRequestId } from '@/lib/api-error-handler'

describe('Utils', () => {
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
})
