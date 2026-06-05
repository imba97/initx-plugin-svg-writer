import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { confirm } from '@inquirer/prompts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { writeSvgFile } from '../../src/handlers/write'

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn()
}))

const VALID_SVG = '<svg viewBox="0 0 16 16"><path /></svg>'
const tmpRoot = path.join(process.cwd(), '.tmp-write-tests')

function createTmpDir(name: string): string {
  const dir = path.join(tmpRoot, name)
  mkdirSync(dir, { recursive: true })
  return dir
}

afterEach(() => {
  vi.mocked(confirm).mockReset()
  if (existsSync(tmpRoot)) {
    rmSync(tmpRoot, { recursive: true, force: true })
  }
})

describe('writeSvgFile', () => {
  it('writes a new svg file', async () => {
    const cwd = createTmpDir('write-new')
    const result = await writeSvgFile({
      cwd,
      outputDir: 'icons',
      fileName: 'icon.svg',
      svgContent: VALID_SVG,
      overwritePolicy: 'ask'
    })

    expect(result.written).toBe(true)
    expect(readFileSync(result.targetPath, 'utf8')).toBe(`${VALID_SVG}\n`)
  })

  it('skips existing file when overwrite policy is never', async () => {
    const cwd = createTmpDir('write-never')
    const outputDir = path.join(cwd, 'icons')
    mkdirSync(outputDir, { recursive: true })
    const targetPath = path.join(outputDir, 'icon.svg')
    const original = 'original'
    writeFileSync(targetPath, original, 'utf8')

    const result = await writeSvgFile({
      cwd,
      outputDir: 'icons',
      fileName: 'icon.svg',
      svgContent: VALID_SVG,
      overwritePolicy: 'never'
    })

    expect(result.written).toBe(false)
    expect(readFileSync(targetPath, 'utf8')).toBe(original)
  })

  it('asks before overwriting when policy is ask', async () => {
    const cwd = createTmpDir('write-ask-decline')
    const outputDir = path.join(cwd, 'icons')
    mkdirSync(outputDir, { recursive: true })
    const targetPath = path.join(outputDir, 'icon.svg')
    writeFileSync(targetPath, 'original', 'utf8')
    vi.mocked(confirm).mockResolvedValue(false)

    const result = await writeSvgFile({
      cwd,
      outputDir: 'icons',
      fileName: 'icon.svg',
      svgContent: VALID_SVG,
      overwritePolicy: 'ask'
    })

    expect(result.written).toBe(false)
    expect(readFileSync(targetPath, 'utf8')).toBe('original')
  })

  it('overwrites existing file when policy is ask and confirmed', async () => {
    const cwd = createTmpDir('write-ask-confirm')
    const outputDir = path.join(cwd, 'icons')
    mkdirSync(outputDir, { recursive: true })
    const targetPath = path.join(outputDir, 'icon.svg')
    writeFileSync(targetPath, 'original', 'utf8')
    vi.mocked(confirm).mockResolvedValue(true)

    const result = await writeSvgFile({
      cwd,
      outputDir: 'icons',
      fileName: 'icon.svg',
      svgContent: VALID_SVG,
      overwritePolicy: 'ask'
    })

    expect(result.written).toBe(true)
    expect(readFileSync(targetPath, 'utf8')).toBe(`${VALID_SVG}\n`)
  })

  it('overwrites existing file when policy is always', async () => {
    const cwd = createTmpDir('write-always')
    const outputDir = path.join(cwd, 'icons')
    mkdirSync(outputDir, { recursive: true })
    const targetPath = path.join(outputDir, 'icon.svg')
    writeFileSync(targetPath, 'original', 'utf8')

    const result = await writeSvgFile({
      cwd,
      outputDir: 'icons',
      fileName: 'icon.svg',
      svgContent: VALID_SVG,
      overwritePolicy: 'always'
    })

    expect(result.written).toBe(true)
    expect(readFileSync(targetPath, 'utf8')).toBe(`${VALID_SVG}\n`)
    expect(confirm).not.toHaveBeenCalled()
  })
})
