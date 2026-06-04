import type { InitxContext, InitxMatcherRules } from '@initx-plugin/core'
import type { SvgWriterStore } from './types'
import { InitxPlugin } from '@initx-plugin/core'
import { logger } from '@initx-plugin/utils'
import { CONFIG_SUB_COMMAND, SVG_COMMAND } from './constants'
import { runConfig, runSvg } from './handlers/run-svg'
import { DEFAULT_STORE } from './store/default'

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
        CONFIG_SUB_COMMAND
      ],
      verify(_ctx, ...args) {
        const normalizedArgs = normalizeArgs(args)
        if (normalizedArgs.length === 0) {
          return true
        }
        return normalizedArgs.length === 1 && normalizedArgs[0] === CONFIG_SUB_COMMAND
      }
    }
  ]

  async handle(ctx: InitxContext<SvgWriterStore>, ...args: string[]) {
    const normalizedArgs = normalizeArgs(args)

    if (normalizedArgs[0] === CONFIG_SUB_COMMAND) {
      await runConfig(ctx)
      return
    }

    if (normalizedArgs.length > 0) {
      logger.warn(`Unsupported sub-command: ${normalizedArgs.join(' ')}`)
      logger.info('Usage: ix svg | ix svg config')
      return
    }

    await runSvg(ctx)
  }
}
