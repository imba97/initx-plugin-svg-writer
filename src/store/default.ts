import type { SvgWriterStore } from '../types'
import {
  DEFAULT_ICON_ROOTS,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_OVERWRITE_POLICY
} from '../constants'

export const DEFAULT_STORE: SvgWriterStore = {
  outputDir: DEFAULT_OUTPUT_DIR,
  overwritePolicy: DEFAULT_OVERWRITE_POLICY,
  iconRoots: [...DEFAULT_ICON_ROOTS]
}
