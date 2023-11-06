import crypto from 'crypto'
import { Stats, readdirSync, statSync } from 'fs'
import lodash from 'lodash'
import { join } from 'path'

export function exists<T>(value?: T | null): value is T {
   return (value ?? null) !== null
}

export interface PathInfo {
   path: string
   name: string
   info: Stats
}

export function listChildren(dir: string): PathInfo[] {
   const unsorted = readdirSync(dir).map(name => {
      const path = join(dir, name)
      const info = statSync(path)
      return { name, path, info }
   })
   return lodash.orderBy(unsorted, it => it.name)
}

export function fileHash(content: Buffer, type = 'sha256') {
   return crypto.createHash(type).update(content).digest('hex')
}

export function arrayOrSelf<T>(value?: T | T[]) {
   if (!value) return []
   return Array.isArray(value) ? value : [value]
}
