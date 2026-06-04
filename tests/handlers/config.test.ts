import type { SvgWriterStore } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { DEFAULT_OUTPUT_DIR, DEFAULT_OVERWRITE_POLICY } from '../../src/constants'
import { resolveStoreConfig } from '../../src/handlers/config'

describe('resolveStoreConfig', () => {
  it('keeps valid normalized config', () => {
    const store: SvgWriterStore = {
      outputDir: '  ./icons  ',
      overwritePolicy: 'never'
    }

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: './icons',
      overwritePolicy: 'never'
    })
  })

  it('uses default outputDir when blank', () => {
    const store = {
      outputDir: '   ',
      overwritePolicy: 'always'
    } as SvgWriterStore

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: DEFAULT_OUTPUT_DIR,
      overwritePolicy: 'always'
    })
  })

  it('uses default overwritePolicy when value is invalid', () => {
    const store = {
      outputDir: './icons',
      overwritePolicy: 'invalid'
    } as unknown as SvgWriterStore

    expect(resolveStoreConfig(store)).toEqual({
      outputDir: './icons',
      overwritePolicy: DEFAULT_OVERWRITE_POLICY
    })
  })
})
