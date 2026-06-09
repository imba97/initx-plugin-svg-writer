import type { SvgWriterStore } from '../../src/types'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ICON_ROOTS,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_OVERWRITE_POLICY
} from '../../src/constants'
import {
  formatIconRoots,
  normalizeIconRoots,
  parseIconRootsInput,
  resolveStoreConfig
} from '../../src/handlers/config'

describe('resolveStoreConfig', () => {
  it('keeps valid normalized config', () => {
    const store: SvgWriterStore = {
      outputDir: '  ./icons  ',
      overwritePolicy: 'never',
      iconRoots: [' src/static/common ', 'src/static/user-side']
    }

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: './icons',
      overwritePolicy: 'never',
      iconRoots: ['src/static/common', 'src/static/user-side']
    })
  })

  it('uses default outputDir when blank', () => {
    const store = {
      outputDir: '   ',
      overwritePolicy: 'always',
      iconRoots: ['src/static']
    } as SvgWriterStore

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: DEFAULT_OUTPUT_DIR,
      overwritePolicy: 'always',
      iconRoots: ['src/static']
    })
  })

  it('uses default overwritePolicy when value is invalid', () => {
    const store = {
      outputDir: './icons',
      overwritePolicy: 'invalid',
      iconRoots: ['src/static']
    } as unknown as SvgWriterStore

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: './icons',
      overwritePolicy: DEFAULT_OVERWRITE_POLICY,
      iconRoots: ['src/static']
    })
  })

  it('uses default iconRoots when empty', () => {
    const store = {
      outputDir: './icons',
      overwritePolicy: 'ask',
      iconRoots: ['  ', '']
    } as SvgWriterStore

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: './icons',
      overwritePolicy: 'ask',
      iconRoots: [...DEFAULT_ICON_ROOTS]
    })
  })
})

describe('iconRoots helpers', () => {
  it('parses comma-separated icon roots', () => {
    expect(parseIconRootsInput('src/static/common, src/static/user-side')).toEqual([
      'src/static/common',
      'src/static/user-side'
    ])
  })

  it('formats icon roots for config display', () => {
    expect(formatIconRoots(['src/static/common', 'src/static/user-side'])).toBe(
      'src/static/common,src/static/user-side'
    )
  })

  it('falls back to default icon roots', () => {
    expect(normalizeIconRoots(undefined)).toEqual([...DEFAULT_ICON_ROOTS])
  })
})
