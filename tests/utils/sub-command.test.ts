import { describe, expect, it } from 'vitest'
import { CLEAR_SUB_COMMAND, CONFIG_SUB_COMMAND, DIRS_SUB_COMMAND } from '../../src/constants'
import { isSvgSubCommand } from '../../src/utils/sub-command'

describe('isSvgSubCommand', () => {
  it('accepts supported sub-commands', () => {
    expect(isSvgSubCommand(CONFIG_SUB_COMMAND)).toBe(true)
    expect(isSvgSubCommand(DIRS_SUB_COMMAND)).toBe(true)
    expect(isSvgSubCommand(CLEAR_SUB_COMMAND)).toBe(true)
  })

  it('rejects unknown sub-commands', () => {
    expect(isSvgSubCommand('unknown')).toBe(false)
    expect(isSvgSubCommand('')).toBe(false)
  })
})
