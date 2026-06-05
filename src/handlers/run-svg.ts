import type { InitxContext } from '@initx-plugin/core'
import type { SvgWriterStore } from '../types'
import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { CMD_CLEAR, CMD_DONE } from '../constants'
import { askIconName } from '../io/plain-input'
import { askSvgContent } from '../io/svg-input'
import { resolveStoreConfig } from './config'
import { writeSvgFile } from './write'

export async function runSvg(ctx: InitxContext<SvgWriterStore>): Promise<void> {
  const config = resolveStoreConfig(ctx.store)

  logger.info(`Commands: type "/" to open command palette (${CMD_CLEAR} · ${CMD_DONE})`)
  logger.info('In palette: use ↑/↓ to navigate, Enter to select, Esc to close')
  logger.info('Paste SVG content line by line, submit an empty line to finish')

  while (true) {
    const svgContent = await askSvgContent()
    if (svgContent === null) {
      logger.info('SVG input finished')
      return
    }

    while (true) {
      const fileName = await askIconName()
      const writeResult = await writeSvgFile({
        cwd: process.cwd(),
        outputDir: config.outputDir,
        fileName,
        svgContent,
        overwritePolicy: config.overwritePolicy
      })

      if (writeResult.written) {
        logger.success(`Saved: ${writeResult.targetPath}`)
        break
      }

      logger.warn(`Skipped existing file: ${writeResult.targetPath}`)
      if (config.overwritePolicy === 'never' || config.overwritePolicy === 'ask') {
        logger.info('Please input another file name')
      }
    }
  }
}
