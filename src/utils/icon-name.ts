export function sanitizeIconName(rawName: string): string {
  const cleaned = rawName
    .trim()
    .replace(/\.svg$/i, '')
    .replace(/[\\/:*?"<>|]/g, '-')

  if (!cleaned) {
    return ''
  }

  return `${cleaned}.svg`
}
