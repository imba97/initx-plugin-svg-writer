import { describe, expect, it } from 'vitest'
import { CMD_CLEAR, CMD_DONE, SVG_SLASH_COMMANDS } from '../../src/constants'
import {
  getFilteredCommands,
  nextActiveIndex,
  renderCommandPalette
} from '../../src/ui/command-palette'

describe('getFilteredCommands', () => {
  it('hides /done command when allowDone is false', () => {
    const result = getFilteredCommands(SVG_SLASH_COMMANDS, '/', false)
    expect(result.some(item => item.value === CMD_DONE)).toBe(false)
    expect(result.some(item => item.value === CMD_CLEAR)).toBe(true)
  })

  it('filters by slash prefix', () => {
    const result = getFilteredCommands(SVG_SLASH_COMMANDS, '/cl', true)
    expect(result).toHaveLength(1)
    expect(result[0]?.value).toBe(CMD_CLEAR)
  })

  it('filters by description keyword', () => {
    const result = getFilteredCommands(SVG_SLASH_COMMANDS, '/finish', true)
    expect(result).toHaveLength(1)
    expect(result[0]?.value).toBe(CMD_DONE)
  })

  it('falls back to available commands when keyword does not match', () => {
    const result = getFilteredCommands(SVG_SLASH_COMMANDS, '/unknown', true)
    expect(result.map(item => item.value)).toEqual([CMD_CLEAR, CMD_DONE])
  })
})

describe('nextActiveIndex', () => {
  it('returns zero when list is empty', () => {
    expect(nextActiveIndex(2, 0, 1)).toBe(0)
  })

  it('wraps upward from first item', () => {
    expect(nextActiveIndex(0, 2, -1)).toBe(1)
  })

  it('wraps downward from last item', () => {
    expect(nextActiveIndex(1, 2, 1)).toBe(0)
  })
})

describe('renderCommandPalette', () => {
  it('renders no-match text for empty command list', () => {
    expect(renderCommandPalette([], 0)).toContain('No command matched')
  })

  it('renders command labels and active cursor', () => {
    const output = renderCommandPalette(SVG_SLASH_COMMANDS, 1)
    expect(output).toContain('/clear')
    expect(output).toContain('/done')
    expect(output).toContain('❯')
  })
})
