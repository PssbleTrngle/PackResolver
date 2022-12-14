import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export type PacksConfig = {
   packs: Record<string, PackConfig | undefined>
}

export interface PackConfig {
   paths?: string[]
   priority?: number
   disabled?: boolean
}

export function getConfig(dir: string): PacksConfig {
   const path = join(dir, 'config.json')
   if (!existsSync(path)) return { packs: {} }
   const raw = readFileSync(path).toString()
   return JSON.parse(raw)
}
