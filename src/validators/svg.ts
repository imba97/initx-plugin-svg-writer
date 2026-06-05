const SVG_COMPLETE_PATTERN = /<\/svg>\s*$/i

export function isSvgComplete(svgRaw: string): boolean {
  return SVG_COMPLETE_PATTERN.test(svgRaw.trim())
}

export function validateSvg(svgRaw: string): string | null {
  const svg = svgRaw.trim()
  if (!svg) {
    return 'SVG content is empty'
  }

  if (!/^<svg\b[\s\S]*>/i.test(svg)) {
    return 'SVG must start with <svg ...>'
  }

  if (!isSvgComplete(svg)) {
    return 'SVG must end with </svg>'
  }

  const openTagMatch = svg.match(/^<svg\b([^>]*)>/i)
  if (!openTagMatch) {
    return 'Cannot parse svg opening tag'
  }

  const attrs = openTagMatch[1]
  if (!/\sxmlns\s*=|\sviewBox\s*=/i.test(attrs)) {
    return 'SVG tag must include xmlns or viewBox'
  }

  return null
}
