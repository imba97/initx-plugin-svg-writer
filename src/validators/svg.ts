export function validateSvg(svgRaw: string): string | null {
  const svg = svgRaw.trim()
  if (!svg) {
    return 'SVG content is empty'
  }

  if (!/^<svg\b[\s\S]*>/i.test(svg)) {
    return 'SVG must start with <svg ...>'
  }

  if (!/<\/svg>\s*$/i.test(svg)) {
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
