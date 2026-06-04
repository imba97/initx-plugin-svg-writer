import type { SlashCommandItem } from './types'
import { styleText } from 'node:util'
import { CMD_DONE } from '../constants'

function normalizeKeyword(rawLine: string): string {
  const trimmed = rawLine.trim()
  if (!trimmed.startsWith('/')) {
    return ''
  }
  return trimmed.slice(1).toLowerCase()
}

export function getFilteredCommands(
  commands: readonly SlashCommandItem[],
  rawLine: string,
  allowDone: boolean
): SlashCommandItem[] {
  const available = allowDone
    ? [...commands]
    : commands.filter(command => command.value !== CMD_DONE)

  const keyword = normalizeKeyword(rawLine)
  if (!keyword) {
    return available
  }

  const startsWith = available.filter((command) => {
    return command.label.toLowerCase().startsWith(`/${keyword}`)
  })
  if (startsWith.length > 0) {
    return startsWith
  }

  const includes = available.filter((command) => {
    return command.label.toLowerCase().includes(keyword)
      || command.description.toLowerCase().includes(keyword)
  })
  return includes.length > 0 ? includes : available
}

export function nextActiveIndex(current: number, length: number, step: -1 | 1): number {
  if (length <= 0) {
    return 0
  }
  return (current + step + length) % length
}

export function renderCommandPalette(commands: readonly SlashCommandItem[], active: number): string {
  if (commands.length === 0) {
    return styleText('yellow', 'No command matched')
  }

  return commands.map((command, index) => {
    const isActive = index === active
    const cursor = isActive ? styleText('cyan', '❯') : ' '
    const label = isActive ? styleText('cyan', command.label) : command.label
    const description = styleText('dim', command.description)
    return `${cursor} ${label} ${description}`
  }).join('\n')
}
