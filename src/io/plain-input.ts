import { logger } from '@initx-plugin/utils'
import { input } from '@inquirer/prompts'
import { NAME_PROMPT } from '../constants'
import { sanitizeIconName } from '../utils/icon-name'

export async function askIconName(): Promise<string> {
  while (true) {
    const iconName = await input({
      message: NAME_PROMPT
    })
    const fileName = sanitizeIconName(iconName)
    if (!fileName) {
      logger.warn('Icon name cannot be empty or only invalid characters')
      continue
    }
    return fileName
  }
}
