import type { SvgSlashCommand } from '../types'

export interface SlashCommandItem {
  value: SvgSlashCommand
  label: string
  description: string
}

export type SvgLinePromptResult
  = | { type: 'line', value: string }
    | { type: 'command', value: SvgSlashCommand }
