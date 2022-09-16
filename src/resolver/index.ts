import { existsSync } from 'fs'
import lodash from 'lodash'
import { extname, join, resolve } from 'path'
import { Config, getConfig } from '../config.js'
import Options from '../options.js'
import { arrayOrSelf, exists, listChildren } from '../util.js'
import ArchiveResolver from './ArchiveResolver.js'
import FolderResolver from './FolderResolver.js'
import { IResolver } from './IResolver.js'

export interface ResolverInfo {
   resolver: IResolver
   name: string
}

function createResolverFor(
   options: Omit<Options, 'from'>,
   from: string,
   config: Config = getConfig(from)
): ResolverInfo[] {
   if (!existsSync(from)) {
      throw new Error(`input directory not found: ${resolve(from)}`)
   }

   const packs = listChildren(from)
      .map(it => ({ ...it, config: config.packs[it.name] }))
      .filter(it => !it.config?.disabled)

   const exlude = arrayOrSelf(options.exclude)

   function resolversOf({ path, name, info }: typeof packs[0]) {
      const paths = ['.']
      return paths
         .map(relativePath => {
            const realPath = join(path, relativePath)
            if (info.isFile() && ['.zip', '.jar'].includes(extname(name))) return new ArchiveResolver(realPath, exlude)
            if (info.isDirectory()) return new FolderResolver(realPath, exlude)
            return null
         })
         .filter(exists)
   }

   const resolvers = lodash
      .orderBy(packs, it => it.config?.priority ?? 0)
      .flatMap(file => resolversOf(file).map(resolver => ({ ...file, resolver })))
      .filter(exists)

   return resolvers
}

export default function createResolvers(options: Options, config?: Config) {
   const resolvers = arrayOrSelf(options.from).flatMap(from => createResolverFor(options, from, config))
   console.log(`Found ${resolvers.length} resource/data packs`)
   return resolvers
}
