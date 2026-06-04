import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { input } from '@inquirer/prompts'
import {
  CMD_CLEAR,
  CMD_DONE,
  SVG_CONTINUATION_PROMPT,
  SVG_PROMPT
} from '../constants'
import { runSvgSession } from '../ui/session'
import { validateSvg } from '../validators/svg'

function isDoneCommand(value: string): boolean {
  return value.trim() === CMD_DONE
}

function isClearCommand(value: string): boolean {
  return value.trim() === CMD_CLEAR
}

export async function askSvgContent(): Promise<string | null> {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    return runSvgSession()
  }

  logger.info('TTY is not available, fallback to plain line input mode')
  return askSvgContentFallback()
}

async function askSvgContentFallback(): Promise<string | null> {
  let lines: string[] = []

  while (true) {
    const promptLabel = lines.length > 0 ? SVG_CONTINUATION_PROMPT : SVG_PROMPT
    const line = await input({
      message: promptLabel
    })

    if (lines.length === 0 && isDoneCommand(line)) {
      return null
    }

    if (isClearCommand(line)) {
      lines = []
      logger.info('Cleared SVG input buffer')
      continue
    }

    if (!line && lines.length === 0) {
      continue
    }

    if (!line && lines.length > 0) {
      const svg = lines.join('\n')
      const invalidReason = validateSvg(svg)
      if (!invalidReason) {
        return svg
      }

      logger.warn(`SVG validation failed: ${invalidReason}`)
      lines = []
      continue
    }

    lines.push(line)

    const combined = lines.join('\n')
    if (/<\/svg>\s*$/i.test(combined.trim())) {
      const invalidReason = validateSvg(combined)
      if (!invalidReason) {
        return combined
      }

      logger.warn(`SVG validation failed: ${invalidReason}`)
      lines = []
    }
  }
}
