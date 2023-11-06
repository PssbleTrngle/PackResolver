import { Options, createMergedResolver } from '../../src/index.js'

export default function createTestResolver(options: Partial<Options>) {
   return createMergedResolver({ silent: true, from: 'test/resources', ...options })
}
