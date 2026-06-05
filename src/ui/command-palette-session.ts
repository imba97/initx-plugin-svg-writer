import type { SvgSlashCommand } from '../types'
import type { KeyInfo } from './keypress'
import process from 'node:process'
import { styleText } from 'node:util'
import { CMD_CLEAR, CMD_DONE, SVG_SLASH_COMMANDS } from '../constants'
import {
  getFilteredCommands,
  nextActiveIndex,
  renderCommandPalette
} from './command-palette'
import { ensureKeypressEvents } from './keypress'
import { getPromptLabel, hideCursor, showCursor } from './tty-style'

export async function openCommandPalette(promptLabel: string, allowDone: boolean): Promise<SvgSlashCommand | null> {
  ensureKeypressEvents(process.stdin)
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
