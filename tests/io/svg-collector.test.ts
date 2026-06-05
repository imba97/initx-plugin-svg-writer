import { describe, expect, it } from 'vitest'
import { collectSvgLines, processSvgLine } from '../../src/io/svg-collector'

const VALID_SVG = '<svg viewBox="0 0 16 16"><path /></svg>'

describe('processSvgLine', () => {
  it('ignores empty line when buffer is empty', () => {
    expect(processSvgLine([], '')).toEqual({ status: 'continue', lines: [] })
  })

  it('completes when empty line is submitted with buffered lines', () => {
    const lines = [VALID_SVG]
    expect(processSvgLine(lines, '')).toEqual({
      status: 'complete',
      svg: VALID_SVG
    })
  })

  it('accumulates lines until svg is complete', () => {
    expect(processSvgLine([], '<svg viewBox="0 0 16 16">')).toEqual({
      status: 'continue',
      lines: ['<svg viewBox="0 0 16 16">']
    })
    expect(processSvgLine(['<svg viewBox="0 0 16 16">'], '<path /></svg>')).toEqual({
      status: 'complete',
      svg: '<svg viewBox="0 0 16 16">\n<path /></svg>'
    })
  })

  it('clears buffer when validation fails on complete svg', () => {
    expect(processSvgLine([], '<svg><path /></svg>')).toEqual({
      status: 'continue',
      lines: []
    })
  })
})

describe('collectSvgLines', () => {
  it('returns null when session ends on first line', async () => {
    const svg = await collectSvgLines(async () => ({ type: 'session-end' }))
    expect(svg).toBeNull()
  })

  it('returns null when /done command is selected', async () => {
    let calls = 0
    const svg = await collectSvgLines(async () => {
      calls += 1
      if (calls === 1) {
        return { type: 'command', value: '/done' }
      }
      throw new Error('should not read again')
    })
    expect(svg).toBeNull()
  })

  it('clears buffer on /clear command', async () => {
    let calls = 0
    const svg = await collectSvgLines(async () => {
      calls += 1
      if (calls === 1) {
        return { type: 'line', value: '<svg viewBox="0 0 16 16">' }
      }
      if (calls === 2) {
        return { type: 'command', value: '/clear' }
      }
      return { type: 'line', value: VALID_SVG }
    })
    expect(svg).toBe(VALID_SVG)
  })

  it('collects multiline svg input', async () => {
    let calls = 0
    const lines = [
      '<svg viewBox="0 0 16 16">',
      '<path />',
      '</svg>'
    ]
    const svg = await collectSvgLines(async () => {
      const line = lines[calls]
      calls += 1
      return { type: 'line', value: line ?? '' }
    })
    expect(svg).toBe('<svg viewBox="0 0 16 16">\n<path />\n</svg>')
  })
})
