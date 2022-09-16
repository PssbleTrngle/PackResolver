import minimatch from 'minimatch'
import StreamZip from 'node-stream-zip'
import { Acceptor, IResolver } from './IResolver.js'

export default class ArchiveResolver implements IResolver {
   constructor(private readonly archive: string, private readonly exlude: string[]) {}

   async extract(acceptor: Acceptor) {
      const zip = new StreamZip.async({ file: this.archive })
      const entries = await zip.entries()

      await Promise.all(
         Object.values(entries).map(async entry => {
            if (!entry.isFile) return
            if (this.exlude.some(pattern => minimatch(entry.name, pattern))) return

            acceptor(entry.name, await zip.entryData(entry))
         })
      )

      await zip.close()
   }
}
