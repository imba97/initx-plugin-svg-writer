import { styleText } from 'node:util'
import { SVG_PROMPT } from '../constants'

export function getPromptLabel(promptLabel: string): string {
  if (promptLabel === SVG_PROMPT) {
    return styleText(['cyan', 'bold'], promptLabel)
  }
  return styleText('gray', promptLabel)
}

export function getInputValueLabel(value: string): string {
  return styleText(['white', 'dim'], value)
}

export function trimLastChar(inputValue: string): string {
  if (!inputValue) {
    return inputValue
  }

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('zh-Hans', { granularity: 'grapheme' })
    const segments = [...segmenter.segment(inputValue)]
    return segments.slice(0, -1).map(segment => segment.segment).join('')
  }

  return Array.from(inputValue).slice(0, -1).join('')
}

export function redrawPromptLine(outputStream: NodeJS.WriteStream, promptLabel: string, value: string) {
  outputStream.write('\r\x1B[2K')
  outputStream.write(`${getPromptLabel(promptLabel)} ${getInputValueLabel(value)}`)
}

export function hideCursor(outputStream: NodeJS.WriteStream) {
  outputStream.write('\x1B[?25l')
}

export function showCursor(outputStream: NodeJS.WriteStream) {
  outputStream.write('\x1B[?25h')
}
