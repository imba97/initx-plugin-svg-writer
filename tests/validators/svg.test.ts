import { describe, expect, it } from 'vitest'
import { isSvgComplete, validateSvg } from '../../src/validators/svg'

describe('isSvgComplete', () => {
  it('returns true when svg ends with closing tag', () => {
    expect(isSvgComplete('<svg viewBox="0 0 16 16"><path /></svg>')).toBe(true)
    expect(isSvgComplete('  <svg viewBox="0 0 16 16"></svg>  ')).toBe(true)
  })

  it('returns false for incomplete svg', () => {
    expect(isSvgComplete('<svg viewBox="0 0 16 16"><path />')).toBe(false)
  })
})

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
