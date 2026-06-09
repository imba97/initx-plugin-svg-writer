import type { InitxContext } from '@initx-plugin/core'
import type { SvgWriterStore } from '../types'
import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import {
  collectIconDirTree,
  formatIconDirsReport,
  listSvgFiles,
  resolveOutputDir
} from '../io/icon-dirs'
import { resolveStoreConfig } from './config'

export async function handleDirs(
  ctx: InitxContext<SvgWriterStore>,
  cwd = process.cwd()
): Promise<void> {
  const config = resolveStoreConfig(ctx.store)
  const temporaryDir = config.outputDir
  const temporaryPath = resolveOutputDir(cwd, temporaryDir)
  const temporaryFiles = listSvgFiles(temporaryPath)
  const targetEntries = collectIconDirTree(config.iconRoots, cwd)

  const report = formatIconDirsReport({
    temporaryDir,
    temporaryFiles,
    iconRoots: config.iconRoots,
    targetEntries
  })

  logger.info(report)

  if (temporaryFiles.length === 0) {
    logger.info('No pending icons to organize')
  }
}
