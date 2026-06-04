import type { InitxContext, InitxMatcherRules } from '@initx-plugin/core'
import { InitxPlugin } from '@initx-plugin/core'
import { log } from '@initx-plugin/utils'

interface Store {
  foo: string
}

export default class StarterPlugin extends InitxPlugin<Store> {
  defaultStore = {
    foo: 'bar'
  }

  rules: InitxMatcherRules = [
    {
      matching: 'start',
      description: 'Plugin starter',
      // You can only enter the optional value
      optional: [
        // npx initx start
        undefined,
        // npx initx start foo
        'foo'
      ],
      verify(_ctx, ..._others) {
        log.info('verify function is working')
        return true
      }
    }
  ]

  async handle(ctx: InitxContext<Store>, ...others: string[]) {
    /* eslint-disable no-console */
    log.info('initx-plugin-starter is running 🎊')

    log.info('ctx')
    console.log(ctx)

    log.info('others')
    console.log(others)
  }
}
