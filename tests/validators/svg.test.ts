import { describe, expect, it } from 'vitest'
import { validateSvg } from '../../src/validators/svg'

describe('validateSvg', () => {
  it('returns error when content is empty', () => {
    expect(validateSvg('   ')).toBe('SVG content is empty')
  })

  it('returns error when not starting with svg tag', () => {
    expect(validateSvg('<g></g>')).toBe('SVG must start with <svg ...>')
  })

  it('returns error when missing closing svg tag', () => {
    expect(validateSvg('<svg viewBox="0 0 16 16"><path /></g>')).toBe('SVG must end with </svg>')
  })

  it('returns error when svg tag misses xmlns and viewBox', () => {
    expect(validateSvg('<svg><path /></svg>')).toBe('SVG tag must include xmlns or viewBox')
  })

  it('accepts valid svg with xmlns', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path /></svg>'
    expect(validateSvg(svg)).toBeNull()
  })

  it('accepts valid svg with viewBox', () => {
    const svg = '<svg viewBox="0 0 16 16"><path /></svg>'
    expect(validateSvg(svg)).toBeNull()
  })
})
