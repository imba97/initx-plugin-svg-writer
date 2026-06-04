export type OverwritePolicy = 'ask' | 'always' | 'never'
export type SvgSlashCommand = '/clear' | '/done'

export interface SvgWriterStore {
  outputDir: string
  overwritePolicy: OverwritePolicy
}
