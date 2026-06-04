import type { OverwritePolicy, SvgSlashCommand } from './types'

export const SVG_COMMAND = 'svg'
export const CONFIG_SUB_COMMAND = 'config'

export const SVG_PROMPT = 'svg >'
export const SVG_CONTINUATION_PROMPT = '...'
export const NAME_PROMPT = 'name >'

export const CMD_CLEAR: SvgSlashCommand = '/clear'
export const CMD_DONE: SvgSlashCommand = '/done'

export const SVG_SLASH_COMMANDS = [
  {
    value: CMD_CLEAR,
    label: '/clear',
    description: 'Clear current SVG buffer'
  },
  {
    value: CMD_DONE,
    label: '/done',
    description: 'Finish SVG input session'
  }
] as const

export const SVG_COMMAND_PALETTE_PAGE_SIZE = 6

export const DEFAULT_OUTPUT_DIR = '.auto-generate/icons-temporary'
export const DEFAULT_OVERWRITE_POLICY: OverwritePolicy = 'ask'
