import StreamZip from 'node-stream-zip'
import { FilterOptions } from '../options.js'
import { Acceptor, FilteringResolver } from './IResolver.js'

export default class ArchiveResolver extends FilteringResolver {
   constructor(private readonly archive: string, options: FilterOptions = {}) {
      super(options)
   }

   async accept(acceptor: Acceptor) {
      const zip = new StreamZip.async({ file: this.archive })
      const entries = await zip.entries()

      await Promise.all(
         Object.values(entries)
            .filter(it => this.filter(it.name))
            .map(async entry => {
               if (entry.isFile) {
                  acceptor(entry.name, await zip.entryData(entry))
               }
            })
      )

      await zip.close()
   }
}
