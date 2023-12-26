import { type ReadStream, createReadStream } from 'fs'

type EventType = 'data' | 'error' | 'end'
type MboxDataEventHandler = (buf: Buffer, offset: number) => void
type MboxErrorEventHandler = (err: MboxError) => void
type MboxEndEventHandler = () => void
type EventHandler = MboxDataEventHandler | MboxErrorEventHandler | MboxEndEventHandler

const POSTMARK = Buffer.from('\nFrom ')
const MAX_EMAIL_SIZE = 50 * 1024 * 1024

class MboxError extends Error {
  errorCode: string
  originalError: Error

  constructor (errorCode: string, originalError: Error) {
    super(originalError.message)
    this.errorCode = errorCode
    this.originalError = originalError
  }
}

export class MboxParser {
  readonly #path: string
  #fsStream: ReadStream | undefined
  #currentOffset: number
  #paused: boolean = false
  readonly #queue: Array<[Buffer, number]>
  readonly #eventHandlers: { [e in EventType]: EventHandler[] } = {
    data: [],
    error: [],
    end: []
  }

  constructor (path: string) {
    this.#path = path
    this.#currentOffset = 0
    this.#paused = false
    this.#queue = []
  }

  #startProcessing (): void {
    this.#fsStream = createReadStream(this.#path)
    let remaining = Buffer.from([])

    this.#fsStream.on('data', (chunk: Buffer) => {
      chunk = Buffer.concat([remaining, chunk])

      let postmarkAt = chunk.indexOf(POSTMARK) + 1

      // Postmark not found
      if (postmarkAt === 0) {
        remaining = chunk

        if (chunk.length > MAX_EMAIL_SIZE) {
          this.close(new MboxError('MESSAGE_SIZE_ERROR', new Error(`Invalid message size >=${chunk.length} at ${this.#currentOffset}`)))
        }

        return
      }

      // Postmark found, we have at least one full message.
      while (postmarkAt > 0) {
        const aMessage = Buffer.copyBytesFrom(chunk, 0, postmarkAt)
        remaining = Buffer.copyBytesFrom(chunk, postmarkAt, chunk.length - postmarkAt)

        const messageOffset = this.#currentOffset
        this.#currentOffset += aMessage.length

        this.#queue.push([aMessage, messageOffset])

        // There might be more messages, check the remaining again.
        chunk = remaining
        postmarkAt = chunk.indexOf(POSTMARK) + 1
      }

      setImmediate(() => { this.processQueue() })
    })

    this.#fsStream.on('error', (err: Error) => {
      this.#emit('error', new MboxError('FS_ERROR', err))
    })

    // this.#fsStream.on('end', () => {
    //   this.processQueue();
    //   this.#emit('end');
    // });
  }

  close (err?: MboxError): void {
    if (err !== undefined) {
      this.#emit('error', err)
    }

    if (this.#fsStream !== undefined) {
      this.#fsStream.pause()
      this.#fsStream.close(() => {
        this.#emit('end')
      })
    }
  }

  on (event: 'data', handler: MboxDataEventHandler): void
  on (event: 'error', handler: MboxErrorEventHandler): void
  on (event: 'end', handler: MboxEndEventHandler): void
  on (event: EventType, handler: EventHandler): void {
    this.#eventHandlers[event].push(handler)

    if (event === 'data') {
      this.#startProcessing()
    }
  }

  // @ts-expect-error Unable to satisfy the various conditions
  #emit (event: 'data', buf: Buffer, offset: number): void
  #emit (event: 'error', err: MboxError): void
  #emit (event: 'end'): void
  #emit (event: EventType, bufOrErr?: Buffer & MboxError, offset?: number): void {
    // @ts-expect-error Unable satisfy the various conditions
    this.#eventHandlers[event].forEach(handler => { handler(bufOrErr, offset) })
  }

  pause (): void {
    this.#paused = true

    if (this.#fsStream !== undefined) {
      this.#fsStream.pause()
    }
  }

  resume (): void {
    this.#paused = false

    if (this.#fsStream !== undefined) {
      this.#fsStream?.resume()
    }

    this.processQueue()
  }

  processQueue (): void {
    if (this.#paused) {
      return
    }

    if (this.#queue.length === 0) {
      if (this.#fsStream !== undefined && this.#fsStream.readableEnded) {
        this.#emit('end')
      }
      return
    }

    const [mail, offset] = this.#queue.shift() ?? [Buffer.from([]), 0]
    this.#emit('data', mail, offset)
    setImmediate(() => { this.processQueue() })
  }
}
