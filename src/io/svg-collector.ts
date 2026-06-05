import type { SvgSlashCommand } from '../types'
import { logger } from '@initx-plugin/utils'
import {
  CMD_CLEAR,
  CMD_DONE,
  SVG_CONTINUATION_PROMPT,
  SVG_PROMPT
} from '../constants'
import { isSvgComplete, validateSvg } from '../validators/svg'

export type SvgCollectorInput
  = | { type: 'line', value: string }
    | { type: 'command', value: SvgSlashCommand }
    | { type: 'session-end' }

export type SvgLineReader = (
  promptLabel: string,
  allowDone: boolean
) => Promise<SvgCollectorInput>

type ProcessSvgLineResult
  = | { status: 'continue', lines: string[] }
    | { status: 'complete', svg: string }

export async function collectSvgLines(readLine: SvgLineReader): Promise<string | null> {
  let lines: string[] = []

  while (true) {
    const promptLabel = lines.length > 0 ? SVG_CONTINUATION_PROMPT : SVG_PROMPT
    const input = await readLine(promptLabel, lines.length === 0)

    if (input.type === 'session-end') {
      return null
    }

    if (input.type === 'command') {
      if (input.value === CMD_DONE) {
        return null
      }
      if (input.value === CMD_CLEAR) {
        lines = []
        logger.info('Cleared SVG input buffer')
        continue
      }
    }

    const line = input.type === 'line' ? input.value : ''
    const result = processSvgLine(lines, line)
    if (result.status === 'complete') {
      return result.svg
    }
    lines = result.lines
  }
}

export function processSvgLine(lines: string[], line: string): ProcessSvgLineResult {
  if (!line && lines.length === 0) {
    return { status: 'continue', lines }
  }

  if (!line && lines.length > 0) {
    const svg = lines.join('\n')
    const invalidReason = validateSvg(svg)
    if (!invalidReason) {
      return { status: 'complete', svg }
    }

    logger.warn(`SVG validation failed: ${invalidReason}`)
    return { status: 'continue', lines: [] }
  }

  const nextLines = [...lines, line]
  const combined = nextLines.join('\n')
  if (!isSvgComplete(combined)) {
    return { status: 'continue', lines: nextLines }
  }

  const invalidReason = validateSvg(combined)
  if (!invalidReason) {
    return { status: 'complete', svg: combined }
  }

  logger.warn(`SVG validation failed: ${invalidReason}`)
  return { status: 'continue', lines: [] }
}
