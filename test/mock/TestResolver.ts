import { Options, createResolver } from '../../src/index.js'

export default function createTestResolver(options: Partial<Options>) {
   return createResolver({ silent: true, from: 'test/resources', ...options })
}
