import { createResolver } from './resolver/index.js'
import { Acceptor } from './resolver/IResolver.js'

async function runTest() {
   const resolver = createResolver({ from: 'resources', include: '**/red_*' })

   const acceptor: Acceptor = path => {
      console.log(path)
   }

   await resolver.extract(acceptor)
}

runTest().catch(console.error)
