import type { SvgCollectorInput } from '../io/svg-collector'
import { collectSvgLines } from '../io/svg-collector'
import { SvgInputInterruptedError } from './keypress'
import { readSvgLineOrCommand } from './read-svg-line'

async function readSvgLine(promptLabel: string, allowDone: boolean): Promise<SvgCollectorInput> {
  try {
    const result = await readSvgLineOrCommand(promptLabel, allowDone)
    if (result.type === 'command') {
      return result
    }
    return { type: 'line', value: result.value }
  }
  catch (error) {
    if (error instanceof SvgInputInterruptedError) {
      return { type: 'session-end' }
    }
    throw error
  }
}

export async function runSvgSession(): Promise<string | null> {
  return collectSvgLines(readSvgLine)
}
