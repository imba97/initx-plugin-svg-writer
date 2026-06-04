import type { SvgSlashCommand } from '../types'
import type { SvgLinePromptResult } from './types'
import process from 'node:process'
import { emitKeypressEvents } from 'node:readline'
import { styleText } from 'node:util'
import { logger } from '@initx-plugin/utils'
import { input } from '@inquirer/prompts'
import {
  CMD_CLEAR,
  CMD_DONE,
  SVG_CONTINUATION_PROMPT,
  SVG_PROMPT,
  SVG_SLASH_COMMANDS
} from '../constants'
import { validateSvg } from '../validators/svg'
import {
  getFilteredCommands,
  nextActiveIndex,
  renderCommandPalette
} from './command-palette'

interface KeyInfo {
  name?: string
  sequence?: string
  ctrl?: boolean
  meta?: boolean
}

function getPromptLabel(promptLabel: string): string {
  if (promptLabel === SVG_PROMPT) {
    return styleText(['cyan', 'bold'], promptLabel)
  }
  return styleText('gray', promptLabel)
}

function getInputValueLabel(value: string): string {
  return styleText(['white', 'dim'], value)
}

function trimLastChar(inputValue: string): string {
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

function redrawPromptLine(outputStream: NodeJS.WriteStream, promptLabel: string, value: string) {
  outputStream.write('\r\x1B[2K')
  outputStream.write(`${getPromptLabel(promptLabel)} ${getInputValueLabel(value)}`)
}

function hideCursor(outputStream: NodeJS.WriteStream) {
  outputStream.write('\x1B[?25l')
}

function showCursor(outputStream: NodeJS.WriteStream) {
  outputStream.write('\x1B[?25h')
}

async function openCommandPalette(promptLabel: string, allowDone: boolean): Promise<SvgSlashCommand | null> {
  emitKeypressEvents(process.stdin)
  const inputStream = process.stdin
  const outputStream = process.stdout

  if (!inputStream.isTTY) {
    return allowDone ? CMD_DONE : CMD_CLEAR
  }

  return new Promise((resolve) => {
    let keyword = '/'
    let index = 0
    let renderedLines = 0

    let onKeypress: (char: string, key: KeyInfo) => void

    const getCandidates = () => getFilteredCommands(SVG_SLASH_COMMANDS, keyword, allowDone)

    const clearRenderedMenu = () => {
      if (renderedLines === 0) {
        return
      }
      for (let i = 0; i < renderedLines; i++) {
        outputStream.write('\x1B[2K')
        if (i < renderedLines - 1) {
          outputStream.write('\x1B[1A')
        }
      }
      outputStream.write('\r')
    }

    const render = () => {
      const candidates = getCandidates()
      if (index >= candidates.length) {
        index = 0
      }
      clearRenderedMenu()
      const header = `${getPromptLabel(promptLabel)} ${styleText('gray', keyword)}`
      const body = renderCommandPalette(candidates, index)
      outputStream.write(`${header}\n${body}`)
      renderedLines = 1 + Math.max(candidates.length, 1)
    }

    const cleanup = () => {
      inputStream.off('keypress', onKeypress)
      inputStream.setRawMode(false)
      inputStream.pause()
      clearRenderedMenu()
      showCursor(outputStream)
    }

    const finish = (value: SvgSlashCommand | null) => {
      cleanup()
      resolve(value)
    }

    onKeypress = (char: string, key: KeyInfo) => {
      if (key.ctrl && key.name === 'c') {
        return finish(null)
      }

      if (key.name === 'up') {
        const candidates = getCandidates()
        index = nextActiveIndex(index, candidates.length, -1)
        render()
        return
      }

      if (key.name === 'down') {
        const candidates = getCandidates()
        index = nextActiveIndex(index, candidates.length, 1)
        render()
        return
      }

      if (key.name === 'escape') {
        return finish(null)
      }

      if (key.name === 'backspace') {
        if (keyword.length === 1) {
          return finish(null)
        }
        keyword = keyword.slice(0, -1)
        index = 0
        render()
        return
      }

      if (key.name === 'tab') {
        const candidates = getCandidates()
        const selected = candidates[index] ?? candidates[0]
        if (selected) {
          keyword = selected.label
          index = 0
          render()
        }
        return
      }

      if (key.name === 'return' || key.name === 'enter') {
        const candidates = getCandidates()
        const selected = candidates[index] ?? candidates[0]
        return finish(selected?.value ?? null)
      }

      if (!char || key.ctrl || key.meta) {
        return
      }

      keyword += char
      index = 0
      render()
    }

    hideCursor(outputStream)
    inputStream.resume()
    inputStream.setRawMode(true)
    inputStream.on('keypress', onKeypress)
    render()
  })
}

async function readSvgLineOrCommand(promptLabel: string, allowDone: boolean): Promise<SvgLinePromptResult> {
  emitKeypressEvents(process.stdin)
  const inputStream = process.stdin
  const outputStream = process.stdout

  if (!inputStream.isTTY) {
    const fallbackLine = await input({
      message: promptLabel
    })
    return { type: 'line', value: fallbackLine }
  }

  return new Promise((resolve, reject) => {
    let buffer = ''
    let settled = false
    let pendingSlashTimer: NodeJS.Timeout | null = null
    let hasPendingSlash = false

    let onKeypress: (char: string, key: KeyInfo) => void | Promise<void>

    const flushPendingSlashAsInput = () => {
      if (!hasPendingSlash) {
        return
      }
      hasPendingSlash = false
      if (pendingSlashTimer) {
        clearTimeout(pendingSlashTimer)
        pendingSlashTimer = null
      }
      buffer += '/'
      outputStream.write(getInputValueLabel('/'))
    }

    const cleanup = () => {
      inputStream.off('keypress', onKeypress)
      inputStream.setRawMode(false)
      inputStream.pause()
      if (pendingSlashTimer) {
        clearTimeout(pendingSlashTimer)
        pendingSlashTimer = null
      }
      hasPendingSlash = false
    }

    const resolveOnce = (result: SvgLinePromptResult) => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      resolve(result)
    }

    const rejectOnce = (error: unknown) => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      reject(error)
    }

    const triggerCommandPalette = async () => {
      outputStream.write('\r\x1B[2K')
      cleanup()
      try {
        const command = await openCommandPalette(promptLabel, allowDone)
        if (!command) {
          if (settled) {
            return
          }
          outputStream.write('\r\x1B[2K')
          outputStream.write(`${getPromptLabel(promptLabel)} ${getInputValueLabel(buffer)}`)
          inputStream.resume()
          inputStream.setRawMode(true)
          inputStream.on('keypress', onKeypress)
          return
        }
        if (settled) {
          return
        }
        settled = true
        resolve({ type: 'command', value: command })
      }
      catch (error) {
        rejectOnce(error)
      }
    }

    onKeypress = async (char: string, key: KeyInfo) => {
      const sequence = key.sequence ?? char ?? ''

      if (key.ctrl && key.name === 'c') {
        cleanup()
        showCursor(outputStream)
        process.exit(0)
      }

      // Handle paste/IME/newline chunks in one event.
      if (sequence.length > 1 || sequence.includes('\n') || sequence.includes('\r')) {
        if (hasPendingSlash) {
          flushPendingSlashAsInput()
        }

        const normalized = sequence.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        buffer += normalized
        outputStream.write(getInputValueLabel(normalized))

        if (/<\/svg>\s*$/i.test(buffer.trim())) {
          outputStream.write('\n')
          return resolveOnce({ type: 'line', value: buffer })
        }

        return
      }

      if (key.name === 'return' || key.name === 'enter') {
        if (hasPendingSlash) {
          hasPendingSlash = false
          if (pendingSlashTimer) {
            clearTimeout(pendingSlashTimer)
            pendingSlashTimer = null
          }
          return triggerCommandPalette()
        }
        outputStream.write('\n')
        return resolveOnce({ type: 'line', value: buffer })
      }

      if (key.name === 'backspace') {
        if (hasPendingSlash) {
          hasPendingSlash = false
          if (pendingSlashTimer) {
            clearTimeout(pendingSlashTimer)
            pendingSlashTimer = null
          }
          return
        }
        if (buffer.length > 0) {
          buffer = trimLastChar(buffer)
          redrawPromptLine(outputStream, promptLabel, buffer)
        }
        return
      }

      if (sequence === '/' && (key.name === '/' || key.sequence === '/')) {
        if (hasPendingSlash) {
          flushPendingSlashAsInput()
        }
        hasPendingSlash = true
        pendingSlashTimer = setTimeout(() => {
          if (settled || !hasPendingSlash) {
            return
          }
          hasPendingSlash = false
          pendingSlashTimer = null
          void triggerCommandPalette()
        }, 30)
        return
      }

      if (hasPendingSlash) {
        flushPendingSlashAsInput()
      }

      if (!char || key.ctrl || key.meta) {
        return
      }

      buffer += char
      outputStream.write(getInputValueLabel(char))
    }

    outputStream.write(`${getPromptLabel(promptLabel)} `)
    inputStream.resume()
    inputStream.setRawMode(true)
    inputStream.on('keypress', onKeypress)
  })
}

export async function runSvgSession(): Promise<string | null> {
  let lines: string[] = []

  while (true) {
    const promptLabel = lines.length > 0 ? SVG_CONTINUATION_PROMPT : SVG_PROMPT
    const result = await readSvgLineOrCommand(promptLabel, lines.length === 0)

    if (result.type === 'command') {
      if (result.value === CMD_DONE) {
        return null
      }
      if (result.value === CMD_CLEAR) {
        lines = []
        logger.info('Cleared SVG input buffer')
        continue
      }
    }

    const line = result.value
    if (!line && lines.length === 0) {
      continue
    }

    if (!line && lines.length > 0) {
      const svg = lines.join('\n')
      const invalidReason = validateSvg(svg)
      if (!invalidReason) {
        return svg
      }

      logger.warn(`SVG validation failed: ${invalidReason}`)
      lines = []
      continue
    }

    lines.push(line)

    const combined = lines.join('\n')
    if (/<\/svg>\s*$/i.test(combined.trim())) {
      const invalidReason = validateSvg(combined)
      if (!invalidReason) {
        return combined
      }

      logger.warn(`SVG validation failed: ${invalidReason}`)
      lines = []
    }
  }
}
