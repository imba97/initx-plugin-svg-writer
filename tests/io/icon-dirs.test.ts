import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  collectIconDirTree,
  formatIconDirsReport,
  listSvgFiles,
  resolveIconRoots
} from '../../src/io/icon-dirs'

const tmpRoot = path.join(process.cwd(), '.tmp-icon-dirs-tests')

function createTmpDir(name: string): string {
  const dir = path.join(tmpRoot, name)
  mkdirSync(dir, { recursive: true })
  return dir
}

afterEach(() => {
  if (existsSync(tmpRoot)) {
    rmSync(tmpRoot, { recursive: true, force: true })
  }
})

describe('listSvgFiles', () => {
  it('returns empty list when directory does not exist', () => {
    expect(listSvgFiles(path.join(tmpRoot, 'missing'))).toEqual([])
  })

  it('lists only svg files in a flat directory', () => {
    const dir = createTmpDir('flat')
    writeFileSync(path.join(dir, 'a.svg'), '<svg />')
    writeFileSync(path.join(dir, 'b.SVG'), '<svg />')
    writeFileSync(path.join(dir, 'note.txt'), 'x')

    expect(listSvgFiles(dir)).toEqual(['a.svg', 'b.SVG'])
  })

  it('ignores directories that look like svg files', () => {
    const dir = createTmpDir('dirs')
    mkdirSync(path.join(dir, 'fake.svg'))

    expect(listSvgFiles(dir)).toEqual([])
  })
})

describe('resolveIconRoots', () => {
  it('resolves relative roots against cwd', () => {
    const cwd = createTmpDir('cwd')
    expect(resolveIconRoots(['src/static'], cwd)).toEqual([
      path.resolve(cwd, 'src/static')
    ])
  })
})

describe('collectIconDirTree', () => {
  it('collects nested directories that contain svg files', () => {
    const cwd = createTmpDir('tree')
    const actionsDir = path.join(cwd, 'src/static/common/icons/actions')
    const homeDir = path.join(cwd, 'src/static/user-side/icons/home')
    mkdirSync(actionsDir, { recursive: true })
    mkdirSync(homeDir, { recursive: true })
    writeFileSync(path.join(actionsDir, 'edit.svg'), '<svg />')
    writeFileSync(path.join(homeDir, 'gift.svg'), '<svg />')

    expect(collectIconDirTree(['src/static'], cwd)).toEqual([
      {
        dir: 'src/static/common/icons/actions',
        files: ['edit.svg']
      },
      {
        dir: 'src/static/user-side/icons/home',
        files: ['gift.svg']
      }
    ])
  })

  it('returns empty list when roots do not exist', () => {
    const cwd = createTmpDir('empty')
    expect(collectIconDirTree(['src/static'], cwd)).toEqual([])
  })

  it('deduplicates overlapping icon roots', () => {
    const cwd = createTmpDir('overlap')
    const actionsDir = path.join(cwd, 'src/static/common/icons/actions')
    mkdirSync(actionsDir, { recursive: true })
    writeFileSync(path.join(actionsDir, 'edit.svg'), '<svg />')

    expect(collectIconDirTree(['src/static', 'src/static/common'], cwd)).toEqual([
      {
        dir: 'src/static/common/icons/actions',
        files: ['edit.svg']
      }
    ])
  })
})

describe('formatIconDirsReport', () => {
  it('formats temporary and target sections', () => {
    const report = formatIconDirsReport({
      temporaryDir: '.auto-generate/icons-temporary',
      temporaryFiles: ['scan.svg'],
      iconRoots: ['src/static'],
      targetEntries: [
        {
          dir: 'src/static/common/icons/actions',
          files: ['edit.svg']
        }
      ]
    })

    expect(report).toContain('Temporary: .auto-generate/icons-temporary (1)')
    expect(report).toContain('  scan.svg')
    expect(report).toContain('Targets: src/static')
    expect(report).toContain('  src/static/common/icons/actions')
    expect(report).toContain('    edit.svg')
  })

  it('shows empty temporary section', () => {
    const report = formatIconDirsReport({
      temporaryDir: '.auto-generate/icons-temporary',
      temporaryFiles: [],
      iconRoots: ['src/static'],
      targetEntries: []
    })

    expect(report).toContain('Temporary: .auto-generate/icons-temporary (0)')
    expect(report).toContain('  (no pending icons)')
    expect(report).toContain('  (no icon directories found)')
  })
})
