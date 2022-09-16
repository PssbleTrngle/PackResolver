export interface IResolver {
   extract(acceptor: Acceptor): Promise<void>
}

export interface Acceptor {
   (path: string, content: Buffer | string): void
}
