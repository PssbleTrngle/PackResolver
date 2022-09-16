import createResolvers from './resolver/index.js'
import { Acceptor } from './resolver/IResolver.js'

async function runTest() {
   const resolvers = createResolvers({ from: 'resources', exclude: ['__MACOSX/**'] })

   const acceptor: Acceptor = path => {
      if (path.startsWith('__')) console.log(path)
   }

   await Promise.all(
      resolvers.map(({ resolver }) => {
         return resolver.extract(acceptor)
      })
   )
}

runTest().catch(console.error)
