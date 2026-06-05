import { describe, expect, it } from 'vitest'
import { SvgInputInterruptedError } from '../../src/ui/keypress'

describe('svgInputInterruptedError', () => {
  it('uses a stable error name', () => {
    const error = new SvgInputInterruptedError()
    expect(error.name).toBe('SvgInputInterruptedError')
    expect(error.message).toBe('SVG input interrupted')
  })
})
