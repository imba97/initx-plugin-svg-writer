import type { InitxContext, InitxMatcherRules } from '@initx-plugin/core'
import type { SvgWriterStore } from './types'
import { InitxPlugin } from '@initx-plugin/core'
import { logger } from '@initx-plugin/utils'
import {
  CLEAR_SUB_COMMAND,
  CONFIG_SUB_COMMAND,
  DIRS_SUB_COMMAND,
  SVG_COMMAND,
  SVG_SUB_COMMANDS
} from './constants'
import { handleClearTemp } from './handlers/clear-temp'
import { handleConfig } from './handlers/config'
import { handleDirs } from './handlers/dirs'
import { runSvg } from './handlers/run-svg'
import { DEFAULT_STORE } from './store/default'
import { isSvgSubCommand } from './utils/sub-command'

function normalizeArgs(args: string[]): string[] {
  return args
    .map(arg => String(arg ?? '').trim())
    .filter(arg => arg.length > 0)
}

export default class SvgWriterPlugin extends InitxPlugin<SvgWriterStore> {
  defaultStore = DEFAULT_STORE

  rules: InitxMatcherRules = [
    {
      matching: SVG_COMMAND,
      description: 'Write SVG icons interactively',
      optional: [
        undefined,
        '',
        ...SVG_SUB_COMMANDS
      ],
      verify(_ctx, ...args) {
        const normalizedArgs = normalizeArgs(args)
        if (normalizedArgs.length === 0) {
          return true
        }
        return normalizedArgs.length === 1 && isSvgSubCommand(normalizedArgs[0])
      }
    }
  ]

  async handle(ctx: InitxContext<SvgWriterStore>, ...args: string[]) {
    const normalizedArgs = normalizeArgs(args)

    if (normalizedArgs[0] === CONFIG_SUB_COMMAND) {
      await handleConfig(ctx)
      return
    }

    if (normalizedArgs[0] === DIRS_SUB_COMMAND) {
      await handleDirs(ctx)
      return
    }

    if (normalizedArgs[0] === CLEAR_SUB_COMMAND) {
      await handleClearTemp(ctx)
      return
    }

    if (normalizedArgs.length > 0) {
      logger.warn(`Unsupported sub-command: ${normalizedArgs.join(' ')}`)
      logger.info('Usage: ix svg | ix svg config | ix svg dirs | ix svg clear')
      return
    }

    await runSvg(ctx)
  }
}
