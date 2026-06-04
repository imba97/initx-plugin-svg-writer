import type { InitxContext } from '@initx-plugin/core'
import type { OverwritePolicy, SvgWriterStore } from '../types'
import { logger } from '@initx-plugin/utils'
import { input, select } from '@inquirer/prompts'
import {
  DEFAULT_OUTPUT_DIR,
  DEFAULT_OVERWRITE_POLICY
} from '../constants'

function normalizeOutputDir(value: string): string {
  const trimmed = value.trim()
  return trimmed || DEFAULT_OUTPUT_DIR
}

function normalizeOverwritePolicy(value: string): OverwritePolicy {
  if (value === 'always' || value === 'never' || value === 'ask') {
    return value
  }
  return DEFAULT_OVERWRITE_POLICY
}

export function resolveStoreConfig(store: SvgWriterStore): SvgWriterStore {
  return {
    outputDir: normalizeOutputDir(store.outputDir),
    overwritePolicy: normalizeOverwritePolicy(store.overwritePolicy)
  }
}

export async function handleConfig(ctx: InitxContext<SvgWriterStore>): Promise<void> {
  const current = resolveStoreConfig(ctx.store)

  const outputDir = await input({
    message: 'Output directory',
    default: current.outputDir
  })

  const overwritePolicy = await select<OverwritePolicy>({
    message: 'Overwrite policy',
    choices: [
      { name: 'ask (confirm when file exists)', value: 'ask' },
      { name: 'always (overwrite directly)', value: 'always' },
      { name: 'never (skip existing files)', value: 'never' }
    ],
    default: current.overwritePolicy
  })

  ctx.store.outputDir = normalizeOutputDir(outputDir)
  ctx.store.overwritePolicy = normalizeOverwritePolicy(overwritePolicy)

  logger.success('SVG writer config saved')
  logger.info(`outputDir: ${ctx.store.outputDir}`)
  logger.info(`overwritePolicy: ${ctx.store.overwritePolicy}`)
}
