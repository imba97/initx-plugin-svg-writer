import { SVG_SUB_COMMANDS } from '../constants'

export function isSvgSubCommand(value: string): value is typeof SVG_SUB_COMMANDS[number] {
  return (SVG_SUB_COMMANDS as readonly string[]).includes(value)
}
