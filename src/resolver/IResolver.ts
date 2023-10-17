import { createFilter } from '../filter.js'
import { FilterOptions } from '../options.js'

export interface IResolver {
   extract(acceptor: Acceptor): Promise<void>
}

export interface Acceptor {
   (path: string, content: Buffer | string): void | boolean
}

export abstract class FilteringResolver implements IResolver {
   protected readonly filter

   constructor(options: FilterOptions = {}) {
      this.filter = createFilter(options)
   }

   abstract accept(acceptor: Acceptor): Promise<void>

   async extract(acceptor: Acceptor) {
      return this.accept((path, content) => {
         return acceptor(path, content)
      })
   }
}
