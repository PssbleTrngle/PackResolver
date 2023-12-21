import { Acceptor } from '../../src/index.js'

export interface TestAcceptor extends Acceptor {
   at(path: string): string | null

   paths(): string[]

   jsonAt(path: string): string | null
}

export default function createTestAcceptor(): TestAcceptor {
   const received = new Map<string, string>()

   const acceptor: TestAcceptor = (path, content) => {
      received.set(path, content.toString())
      return true
   }

   acceptor.paths = () => [...received.keys()].sort()

   acceptor.at = path => received.get(path) ?? null
   acceptor.jsonAt = path => {
      const raw = acceptor.at(path)
      return raw && JSON.parse(raw)
   }

   return acceptor
}
