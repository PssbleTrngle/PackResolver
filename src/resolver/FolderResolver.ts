import { readFileSync } from 'fs'
import minimatch from 'minimatch'
import { join } from 'path'
import { listChildren } from '../util.js'
import { Acceptor, IResolver } from './IResolver.js'

export default class FolderResolver implements IResolver {
   constructor(private readonly folder: string, private readonly exlude: string[]) {}

   private recursiveExtract(acceptor: Acceptor, path = '.') {
      const children = listChildren(join(this.folder, path))

      const files = children
         .filter(it => it.info.isFile())
         .filter(it => !this.exlude.some(pattern => minimatch(it.name, pattern)))

      files.forEach(it => acceptor(join(path, it.name), readFileSync(it.path)))

      const folders = children.filter(it => it.info.isDirectory())
      folders.forEach(it => this.recursiveExtract(acceptor, join(path, it.name)))
   }

   async extract(acceptor: Acceptor) {
      return this.recursiveExtract(acceptor)
   }
}
