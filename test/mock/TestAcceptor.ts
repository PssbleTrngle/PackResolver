import { sep } from 'path'
import { join } from 'path/posix'
import { Acceptor } from '../../src/index.js'

export interface TestAcceptor extends Acceptor {
   at(path: string): string | null

   paths(): string[]

   jsonAt(path: string): string | null
}

export default function createTestAcceptor(): TestAcceptor {
   const received = new Map<string, string>()

   const acceptor: TestAcceptor = (path, content) => {
      const posixPath = join(...path.split(sep))
      received.set(posixPath, content.toString())
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
