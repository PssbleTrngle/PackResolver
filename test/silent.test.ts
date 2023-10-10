import createTestAcceptor from './mock/TestAcceptor'
import createTestResolver from './mock/TestResolver'

it('does not log to console with silent option', async () => {
   console.log = jest.fn()

   const resolver = createTestResolver({ silent: true })
   const acceptor = createTestAcceptor()

   await resolver.extract(acceptor)

   expect(console.log).not.toBeCalled()
})
