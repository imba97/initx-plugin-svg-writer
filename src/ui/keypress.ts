import type { ReadStream } from 'node:tty'
import process from 'node:process'
import { emitKeypressEvents } from 'node:readline'

export interface KeyInfo {
  name?: string
  sequence?: string
  ctrl?: boolean
  meta?: boolean
}

const initializedStreams = new WeakSet<ReadStream>()

export function ensureKeypressEvents(stream: ReadStream = process.stdin): void {
  if (initializedStreams.has(stream)) {
    return
  }
  emitKeypressEvents(stream)
  initializedStreams.add(stream)
}

export class SvgInputInterruptedError extends Error {
  constructor() {
    super('SVG input interrupted')
    this.name = 'SvgInputInterruptedError'
  }
}
