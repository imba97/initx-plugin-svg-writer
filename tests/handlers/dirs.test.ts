import type { InitxContext } from '@initx-plugin/core'
import type { SvgWriterStore } from '../../src/types'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { logger } from '@initx-plugin/utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleDirs } from '../../src/handlers/dirs'

vi.mock('@initx-plugin/utils', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn()
  }
}))

const tmpRoot = path.join(process.cwd(), '.tmp-dirs-tests')

function createTmpDir(name: string): string {
  const dir = path.join(tmpRoot, name)
  mkdirSync(dir, { recursive: true })
  return dir
}

function createContext(store: SvgWriterStore): InitxContext<SvgWriterStore> {
  return {
    store
  } as InitxContext<SvgWriterStore>
}

afterEach(() => {
  vi.mocked(logger.info).mockClear()
  if (existsSync(tmpRoot)) {
    rmSync(tmpRoot, { recursive: true, force: true })
  }
})

describe('handleDirs', () => {
  it('logs formatted report for temporary and target directories', async () => {
    const cwd = createTmpDir('dirs')
    const tempDir = path.join(cwd, '.auto-generate/icons-temporary')
    const targetDir = path.join(cwd, 'src/static/common/icons/actions')
    mkdirSync(tempDir, { recursive: true })
    mkdirSync(targetDir, { recursive: true })
    writeFileSync(path.join(tempDir, 'scan.svg'), '<svg />')
    writeFileSync(path.join(targetDir, 'edit.svg'), '<svg />')

    await handleDirs(createContext({
      outputDir: '.auto-generate/icons-temporary',
      overwritePolicy: 'ask',
      iconRoots: ['src/static']
    }), cwd)

    expect(vi.mocked(logger.info)).toHaveBeenCalled()
    const report = String(vi.mocked(logger.info).mock.calls[0]?.[0])
    expect(report).toContain('Temporary: .auto-generate/icons-temporary (1)')
    expect(report).toContain('  scan.svg')
    expect(report).toContain('  src/static/common/icons/actions')
    expect(report).toContain('    edit.svg')
  })

  it('logs no pending icons when temporary directory is empty', async () => {
    const cwd = createTmpDir('empty')

    await handleDirs(createContext({
      outputDir: '.auto-generate/icons-temporary',
      overwritePolicy: 'ask',
      iconRoots: ['src/static']
    }), cwd)

    const calls = vi.mocked(logger.info).mock.calls.map(call => String(call[0]))
    expect(calls.some(text => text.includes('Temporary: .auto-generate/icons-temporary (0)'))).toBe(true)
    expect(calls.some(text => text.includes('No pending icons to organize'))).toBe(true)
  })
})
