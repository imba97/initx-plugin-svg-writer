import type { SvgSlashCommand } from '../types'

export type InputMode = 'normalInput' | 'commandPalette'

export interface SlashCommandItem {
  value: SvgSlashCommand
  label: string
  description: string
}

export type SvgLinePromptResult
  = | { type: 'line', value: string }
    | { type: 'command', value: SvgSlashCommand }

export interface SvgLinePromptConfig {
  message: string
  commands: readonly SlashCommandItem[]
  allowDone: boolean
}
