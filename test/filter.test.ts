import createTestAcceptor from './mock/TestAcceptor.js'
import createTestResolver from './mock/TestResolver.js'

describe('filters using include option', () => {
   it('filters using single include', async () => {
      const resolver = createTestResolver({ include: 'data/*/tags/**/*.json' })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/example/tags/blocks/amber_ores.json',
         'data/minecraft/tags/blocks/mineable/pickaxe.json',
         'data/minecraft/tags/items/stone_tools.json',
      ])
   })

   it('filters using single include in array', async () => {
      const resolver = createTestResolver({ include: ['data/*/recipe/**/*.json'] })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/minecraft/recipe/bread.json',
         'data/minecraft/recipe/cooked_beef.json',
      ])
   })

   it('filters using multiple includes', async () => {
      const resolver = createTestResolver({
         include: ['data/minecraft/recipe/**/*.json', 'data/example/**/*.json'],
      })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/example/tags/blocks/amber_ores.json',
         'data/minecraft/recipe/bread.json',
         'data/minecraft/recipe/cooked_beef.json',
      ])
   })

   it('filters using empty include array', async () => {
      const resolver = createTestResolver({ include: [] })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths().length).toBe(5)
   })
})

describe('filters using exclude option', () => {
   it('filters using single exclude', async () => {
      const resolver = createTestResolver({ exclude: 'data/*/tags/**' })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/minecraft/recipe/bread.json',
         'data/minecraft/recipe/cooked_beef.json',
      ])
   })

   it('filters using single exclude in array', async () => {
      const resolver = createTestResolver({ exclude: ['data/*/recipe/**'] })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/example/tags/blocks/amber_ores.json',
         'data/minecraft/tags/blocks/mineable/pickaxe.json',
         'data/minecraft/tags/items/stone_tools.json',
      ])
   })

   it('filters using multiple exclude', async () => {
      const resolver = createTestResolver({
         exclude: ['data/minecraft/recipe/**/*.json', 'data/example/**'],
      })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths()).toMatchObject([
         'data/minecraft/tags/blocks/mineable/pickaxe.json',
         'data/minecraft/tags/items/stone_tools.json',
      ])
   })

   it('filters using empty exclude array', async () => {
      const resolver = createTestResolver({ exclude: [] })
      const acceptor = createTestAcceptor()

      await resolver.extract(acceptor)

      expect(acceptor.paths().length).toBe(5)
   })
})

it('ignores exclude if include is set', async () => {
   const resolver = createTestResolver({ exclude: 'data/*/tags/**', include: 'data/minecraft/**/*.json' })
   const acceptor = createTestAcceptor()

   await resolver.extract(acceptor)

   expect(acceptor.paths()).toMatchObject([
      'data/minecraft/recipe/bread.json',
      'data/minecraft/recipe/cooked_beef.json',
      'data/minecraft/tags/blocks/mineable/pickaxe.json',
      'data/minecraft/tags/items/stone_tools.json',
   ])
})
