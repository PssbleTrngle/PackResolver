import match from 'minimatch'
import { FilterOptions } from './options.js'
import { arrayOrSelf } from './util.js'

export function createFilter(options: FilterOptions) {
   const include = arrayOrSelf(options.include)
   const exclude = arrayOrSelf(options.exclude)
   return (value: string) => {
      if (include?.length) return include.some(pattern => match(value, pattern))
      return !exclude.some(pattern => match(value, pattern, { dot: true }))
   }
}
