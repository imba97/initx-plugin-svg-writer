import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveOutputDir } from '../../src/utils/path'

describe('resolveOutputDir', () => {
  it('resolves relative output directory', () => {
    const cwd = '/tmp/project'
    expect(resolveOutputDir(cwd, '.auto-generate/icons-temporary')).toBe(
      path.resolve(cwd, '.auto-generate/icons-temporary')
    )
  })

  it('keeps absolute output directory', () => {
    const absolute = '/var/icons'
    expect(resolveOutputDir('/tmp/project', absolute)).toBe(absolute)
  })
})
