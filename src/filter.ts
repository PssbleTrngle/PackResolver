import match, { IOptions as MatchOptions } from 'minimatch'
import { FilterOptions } from './options.js'
import { arrayOrSelf } from './util.js'

export function createFilter(options: FilterOptions) {
   const include = arrayOrSelf(options.include)
   const exclude = arrayOrSelf(options.exclude)
   return (value: string, options: MatchOptions = {}) => {
      if (include?.length) return include.some(pattern => match(value, pattern, options))
      return !exclude.some(pattern => match(value, pattern, { dot: true }))
   }
}
