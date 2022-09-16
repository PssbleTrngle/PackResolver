import minimatch from 'minimatch'
import Options from '../options.js'
import { arrayOrSelf } from '../util.js'

export interface IResolver {
   extract(acceptor: Acceptor): Promise<void>
}

export interface Acceptor {
   (path: string, content: Buffer | string): void | boolean
}

export abstract class FilteringResolver implements IResolver {
   private readonly exlude: string[]

   constructor(exlude: Options['exclude']) {
      this.exlude = arrayOrSelf(exlude)
   }

   abstract accept(acceptor: Acceptor): Promise<void>

   async extract(acceptor: Acceptor) {
      return this.accept((path, content) => {
         if (this.exlude.some(pattern => minimatch(path, pattern, { dot: true }))) return false
         return acceptor(path, content)
      })
   }
}
