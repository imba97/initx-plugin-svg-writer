import type { KeyInfo } from './keypress'
import type { SvgLinePromptResult } from './types'
import process from 'node:process'
import { input } from '@inquirer/prompts'
import { isSvgComplete } from '../validators/svg'
import { openCommandPalette } from './command-palette-session'
import { ensureKeypressEvents, SvgInputInterruptedError } from './keypress'
import {
  getInputValueLabel,
  getPromptLabel,
  redrawPromptLine,
  showCursor,
  trimLastChar
} from './tty-style'

export async function readSvgLineOrCommand(promptLabel: string, allowDone: boolean): Promise<SvgLinePromptResult> {
  ensureKeypressEvents(process.stdin)
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
        return rejectOnce(new SvgInputInterruptedError())
      }

      // Handle paste/IME/newline chunks in one event.
      if (sequence.length > 1 || sequence.includes('\n') || sequence.includes('\r')) {
        if (hasPendingSlash) {
          flushPendingSlashAsInput()
        }

        const normalized = sequence.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        buffer += normalized
        outputStream.write(getInputValueLabel(normalized))

        if (isSvgComplete(buffer)) {
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
