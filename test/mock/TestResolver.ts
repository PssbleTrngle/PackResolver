import { Options, createResolver } from '../../src'

export default function createTestResolver(options: Partial<Options>) {
   return createResolver({ silent: true, from: 'test/resources', ...options })
}
