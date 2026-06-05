import type { OverwritePolicy } from '../types'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { confirm } from '@inquirer/prompts'

export interface WriteSvgInput {
  cwd: string
  outputDir: string
  fileName: string
  svgContent: string
  overwritePolicy: OverwritePolicy
}

export interface WriteSvgResult {
  targetPath: string
  written: boolean
}

function resolveOutputDir(cwd: string, outputDir: string): string {
  if (path.isAbsolute(outputDir)) {
    return outputDir
  }
  return path.resolve(cwd, outputDir)
}

export async function writeSvgFile(input: WriteSvgInput): Promise<WriteSvgResult> {
  const outputDir = resolveOutputDir(input.cwd, input.outputDir)
  const targetPath = path.join(outputDir, input.fileName)

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  if (existsSync(targetPath)) {
    if (input.overwritePolicy === 'never') {
      return { targetPath, written: false }
    }

    if (input.overwritePolicy === 'ask') {
      const shouldOverwrite = await confirm({
        message: `File exists: ${targetPath}. Overwrite?`,
        default: true
      })
      if (!shouldOverwrite) {
        return { targetPath, written: false }
      }
    }
  }

  writeFileSync(targetPath, `${input.svgContent.trim()}\n`, 'utf8')
  return { targetPath, written: true }
}
