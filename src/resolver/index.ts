import { existsSync } from 'fs'
import { extname, join, resolve } from 'path'
import Options from '../options'
import { exists, listChildren } from '../util'
import ArchiveResolver from './ArchiveResolver'
import FolderResolver from './FolderResolver'

export default async function createResolvers(options: Options) {
   if (!existsSync(options.from)) {
      const missingDirectories = [options.from].map(it => '\n   ' + resolve(it))
      throw new Error(`input directory not found: ${missingDirectories}`)
   }

   const packs = listChildren(options.from)

   function resolversOf({ path, name, info }: typeof packs[0]) {
      const paths = ['.']
      return paths
         .map(relativePath => {
            const realPath = join(path, relativePath)
            if (info.isFile() && ['.zip', '.jar'].includes(extname(name))) return new ArchiveResolver(realPath)
            if (info.isDirectory()) return new FolderResolver(realPath)
            return null
         })
         .filter(exists)
   }

   const resolvers = packs.flatMap(file => resolversOf(file).map(resolver => ({ ...file, resolver }))).filter(exists)
   console.log(`Found ${resolvers.length} resource packs`)
}
