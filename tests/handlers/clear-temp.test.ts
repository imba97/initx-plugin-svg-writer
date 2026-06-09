import type { InitxContext } from '@initx-plugin/core'
import type { SvgWriterStore } from '../../src/types'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleClearTemp } from '../../src/handlers/clear-temp'
import { listSvgFiles } from '../../src/io/icon-dirs'

vi.mock('@initx-plugin/utils', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn()
  }
}))

const tmpRoot = path.join(process.cwd(), '.tmp-clear-temp-tests')

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
  if (existsSync(tmpRoot)) {
    rmSync(tmpRoot, { recursive: true, force: true })
  }
})

describe('handleClearTemp', () => {
  it('deletes svg files in temporary directory', async () => {
    const cwd = createTmpDir('clear')
    const tempDir = path.join(cwd, '.auto-generate/icons-temporary')
    mkdirSync(tempDir, { recursive: true })
    writeFileSync(path.join(tempDir, 'a.svg'), '<svg />')
    writeFileSync(path.join(tempDir, 'b.svg'), '<svg />')
    writeFileSync(path.join(tempDir, 'note.txt'), 'x')

    await handleClearTemp(createContext({
      outputDir: '.auto-generate/icons-temporary',
      overwritePolicy: 'ask',
      iconRoots: ['src/static']
    }), cwd)

    expect(listSvgFiles(tempDir)).toEqual([])
    expect(existsSync(path.join(tempDir, 'note.txt'))).toBe(true)
  })

  it('does nothing when temporary directory has no svg files', async () => {
    const cwd = createTmpDir('empty')

    await expect(handleClearTemp(createContext({
      outputDir: '.auto-generate/icons-temporary',
      overwritePolicy: 'ask',
      iconRoots: ['src/static']
    }), cwd)).resolves.toBeUndefined()
  })
})
