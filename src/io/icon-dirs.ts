import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { resolveOutputDir } from '../utils/path'

export { resolveOutputDir }

export interface IconDirEntry {
  dir: string
  files: string[]
}

function isSvgFile(name: string): boolean {
  return name.toLowerCase().endsWith('.svg')
}

export function resolveIconRoots(roots: string[], cwd: string): string[] {
  return roots.map(root => (
    path.isAbsolute(root) ? root : path.resolve(cwd, root)
  ))
}

export function listSvgFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return []
  }

  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && isSvgFile(entry.name))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

function toRelativePath(cwd: string, absolutePath: string): string {
  const relative = path.relative(cwd, absolutePath)
  return relative.split(path.sep).join('/')
}

function walkIconDirs(
  rootDir: string,
  cwd: string,
  entries: IconDirEntry[],
  seenDirs: Set<string>
): void {
  if (!existsSync(rootDir)) {
    return
  }

  const svgFiles: string[] = []
  const childDirs: string[] = []

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const childPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      childDirs.push(childPath)
    }
    else if (entry.isFile() && isSvgFile(entry.name)) {
      svgFiles.push(entry.name)
    }
  }

  if (svgFiles.length > 0) {
    svgFiles.sort((a, b) => a.localeCompare(b))
    const dir = toRelativePath(cwd, rootDir)
    if (!seenDirs.has(dir)) {
      seenDirs.add(dir)
      entries.push({ dir, files: svgFiles })
    }
  }

  for (const childPath of childDirs) {
    walkIconDirs(childPath, cwd, entries, seenDirs)
  }
}

export function collectIconDirTree(roots: string[], cwd: string): IconDirEntry[] {
  const entries: IconDirEntry[] = []
  const seenDirs = new Set<string>()
  const resolvedRoots = resolveIconRoots(roots, cwd)

  for (const rootDir of resolvedRoots) {
    walkIconDirs(rootDir, cwd, entries, seenDirs)
  }

  return entries.sort((a, b) => a.dir.localeCompare(b.dir))
}

export function formatIconDirsReport(input: {
  temporaryDir: string
  temporaryFiles: string[]
  iconRoots: string[]
  targetEntries: IconDirEntry[]
}): string {
  const lines: string[] = []
  const temporaryCount = input.temporaryFiles.length

  lines.push(`Temporary: ${input.temporaryDir} (${temporaryCount})`)
  if (temporaryCount === 0) {
    lines.push('  (no pending icons)')
  }
  else {
    for (const file of input.temporaryFiles) {
      lines.push(`  ${file}`)
    }
  }

  lines.push('')
  lines.push(`Targets: ${input.iconRoots.join(', ')}`)

  if (input.targetEntries.length === 0) {
    lines.push('  (no icon directories found)')
  }
  else {
    for (const entry of input.targetEntries) {
      lines.push(`  ${entry.dir}`)
      for (const file of entry.files) {
        lines.push(`    ${file}`)
      }
    }
  }

  return lines.join('\n')
}
