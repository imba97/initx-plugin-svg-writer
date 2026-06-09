import path from 'node:path'

export function resolveOutputDir(cwd: string, outputDir: string): string {
  if (path.isAbsolute(outputDir)) {
    return outputDir
  }
  return path.resolve(cwd, outputDir)
}
