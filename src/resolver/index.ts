import { existsSync } from 'fs'
import lodash from 'lodash'
import { extname, join, resolve } from 'path'
import { PacksConfig, getConfig } from '../config.js'
import Options from '../options.js'
import { arrayOrSelf, exists, listChildren } from '../util.js'
import ArchiveResolver from './ArchiveResolver.js'
import FolderResolver from './FolderResolver.js'
import { Acceptor, IResolver } from './IResolver.js'

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

export function mergeResolvers(
   resolvers: Array<IResolver | ResolverInfo>,
   options?: Options & { async?: boolean }
): IResolver {
   const runners = resolvers.map(it => (acceptor: Acceptor) => {
      if ('extract' in it) return it.extract(acceptor)
      if (!options?.silent) console.log(it.name)
      return it.resolver.extract(acceptor)
   })

   return {
      extract: async acceptor => {
         if (options?.async !== false) {
            await Promise.all(runners.map(run => run(acceptor)))
         } else {
            for (let run of runners) {
               await run(acceptor)
            }
         }
      },
   }
}

export function createResolvers(options: Options, config?: PacksConfig) {
   const resolvers = arrayOrSelf(options.from).flatMap(from => createResolverFor(options, from, config))
   if (!options.silent) console.log(`Found ${resolvers.length} resource/data packs`)
   return resolvers
}

export function createResolver(options: Options & { async?: boolean }, config?: PacksConfig) {
   const resolvers = createResolvers(options, config)
   return mergeResolvers(resolvers, options)
}
