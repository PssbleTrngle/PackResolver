import { existsSync } from 'fs'
import lodash from 'lodash'
import { extname, join, resolve } from 'path'
import { Config, getConfig } from '../config.js'
import Options from '../options.js'
import { exists, listChildren } from '../util.js'
import ArchiveResolver from './ArchiveResolver.js'
import FolderResolver from './FolderResolver.js'

export default async function createResolvers(options: Options, config: Config = getConfig(options.from)) {
   if (!existsSync(options.from)) {
      const missingDirectories = [options.from].map(it => '\n   ' + resolve(it))
      throw new Error(`input directory not found: ${missingDirectories}`)
   }

   const packs = listChildren(options.from)
      .map(it => ({ ...it, config: config.packs[it.name] }))
      .filter(it => !it.config?.disabled)

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

   const resolvers = lodash
      .orderBy(packs, it => it.config?.priority ?? 0)
      .flatMap(file => resolversOf(file).map(resolver => ({ ...file, resolver })))
      .filter(exists)

   console.log(`Found ${resolvers.length} resource/data packs`)

   return resolvers
}
