import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { input } from '@inquirer/prompts'
import { CMD_CLEAR, CMD_DONE } from '../constants'
import { runSvgSession } from '../ui/session'
import { collectSvgLines } from './svg-collector'

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
  return collectSvgLines(async (promptLabel, allowDone) => {
    const line = await input({
      message: promptLabel
    })

    if (allowDone && isDoneCommand(line)) {
      return { type: 'session-end' }
    }

    if (isClearCommand(line)) {
      return { type: 'command', value: CMD_CLEAR }
    }

    return { type: 'line', value: line }
  })
}
