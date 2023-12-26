import express from 'express'
import dotenv from 'dotenv'
import { mailRouter } from './handlers/mail'
import { connectAndSync } from './lib/db'

dotenv.config()

async function bootstrap (): Promise<void> {
  const app = express()
  const port = process.env.PORT ?? 3000

  app.use('/api', mailRouter)

  try {
    await connectAndSync()
  } catch (e) {
    console.log(`An error occured while connecting to DB: ${(e as any).name}\n${(e as any).parent}`)
  }

  app.listen(port, () => {
    console.log(`Server started on port ${port}`)
  })
}

bootstrap().catch((err: Error) => {
  console.log(`Something went wrong: ${err.stack}`)
})
