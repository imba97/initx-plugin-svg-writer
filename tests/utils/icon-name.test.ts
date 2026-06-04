import { describe, expect, it } from 'vitest'
import { sanitizeIconName } from '../../src/utils/icon-name'

describe('sanitizeIconName', () => {
  it('trims whitespace and appends svg extension', () => {
    expect(sanitizeIconName('  clock  ')).toBe('clock.svg')
  })

  it('removes existing svg extension case-insensitively', () => {
    expect(sanitizeIconName('Clock.SVG')).toBe('Clock.svg')
  })

  it('replaces invalid filename characters', () => {
    expect(sanitizeIconName('foo/bar:baz*icon?')).toBe('foo-bar-baz-icon-.svg')
  })

  it('returns empty string for blank input', () => {
    expect(sanitizeIconName('   ')).toBe('')
  })
})
