import { existsSync } from 'fs'
import lodash from 'lodash'
import { extname, join, resolve } from 'path'
import { getConfig, PacksConfig } from '../config.js'
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
   config: PacksConfig = getConfig(from)
): ResolverInfo[] {
   if (!existsSync(from)) {
      throw new Error(`input directory not found: ${resolve(from)}`)
   }

   const packs = listChildren(from)
      .map(it => ({ ...it, config: config.packs[it.name] }))
      .filter(it => !it.config?.disabled)

   function resolversOf({ path, name, info }: typeof packs[0]) {
      const paths = ['.']
      return paths
         .map(relativePath => {
            const realPath = join(path, relativePath)
            if (info.isFile() && ['.zip', '.jar'].includes(extname(name))) return new ArchiveResolver(realPath, options)
            if (info.isDirectory()) return new FolderResolver(realPath, options)
            return null
         })
         .filter(exists)
   }

   const resolvers = lodash
      .orderBy(packs, it => it.config?.priority ?? 0)
      .flatMap(file => resolversOf(file).map(resolver => ({ resolver, name: file.name })))
      .filter(exists)

   return resolvers
}

export function mergeResolvers(resolvers: Array<IResolver | ResolverInfo>, async = true): IResolver {
   const realResolvers = resolvers.map(it => ('extract' in it ? it : it.resolver))
   return {
      extract: async acceptor => {
         if (async) {
            await Promise.all(realResolvers.map(it => it.extract(acceptor)))
         } else {
            for (let it of realResolvers) {
               await it.extract(acceptor)
            }
         }
      },
   }
}

export function createResolvers(options: Options, config?: PacksConfig) {
   const resolvers = arrayOrSelf(options.from).flatMap(from => createResolverFor(options, from, config))
   console.log(`Found ${resolvers.length} resource/data packs`)
   return resolvers
}

export function createResolver(options: Options & { async?: boolean }, config?: PacksConfig) {
   const resolvers = createResolvers(options, config)
   return mergeResolvers(resolvers, options.async)
}
