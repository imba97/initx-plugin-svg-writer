import type { InitxContext } from '@initx-plugin/core'
import type { SvgWriterStore } from '../types'
import { unlinkSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { listSvgFiles, resolveOutputDir } from '../io/icon-dirs'
import { resolveStoreConfig } from './config'

export async function handleClearTemp(
  ctx: InitxContext<SvgWriterStore>,
  cwd = process.cwd()
): Promise<void> {
  const config = resolveStoreConfig(ctx.store)
  const temporaryPath = resolveOutputDir(cwd, config.outputDir)
  const svgFiles = listSvgFiles(temporaryPath)

  if (svgFiles.length === 0) {
    logger.info(`No SVG files to clear in ${config.outputDir}`)
    return
  }

  for (const file of svgFiles) {
    unlinkSync(path.join(temporaryPath, file))
  }

  logger.success(`Cleared ${svgFiles.length} SVG file(s) from ${config.outputDir}`)
  for (const file of svgFiles) {
    logger.info(`  ${file}`)
  }
}
