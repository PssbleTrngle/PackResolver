import { readFileSync } from 'fs'
import { join } from 'path'
import Options from '../options.js'
import { listChildren } from '../util.js'
import { Acceptor, FilteringResolver } from './IResolver.js'

export default class FolderResolver extends FilteringResolver {
   constructor(private readonly folder: string, exlude: Options['exclude']) {
      super(exlude)
   }

   private recursiveExtract(acceptor: Acceptor, path = '.') {
      const children = listChildren(join(this.folder, path))

      const files = children.filter(it => it.info.isFile())
      files.forEach(it => acceptor(join(path, it.name), readFileSync(it.path)))

      const folders = children.filter(it => it.info.isDirectory())
      folders.forEach(it => this.recursiveExtract(acceptor, join(path, it.name)))
   }

   async accept(acceptor: Acceptor) {
      return this.recursiveExtract(acceptor)
   }
}
