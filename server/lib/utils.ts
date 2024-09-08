import { open } from 'fs/promises'
import { type ParsedMail, simpleParser } from 'mailparser'
import { LABEL_ORDER } from './constants'
import { type Label } from './db'

export function sortLabels (labels: Label[]): Label[] {
  const knownLabels = labels.reduce((map, label) => {
    map.set(label.label.toLowerCase(), label)
    return map
  }, new Map())

  return LABEL_ORDER.map<Label>(label => {
    if (knownLabels.has(label)) {
      const orderedLabel = knownLabels.get(label)
      knownLabels.delete(label)
      return orderedLabel
    }
    return null
  })
    .filter(item => item !== null)
    .concat([...knownLabels.values()])
}

export function normalizeKeyword (keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9 .-]/g, '_')
    .replace(/_+$/g, '')
}

export async function readMailFromMbox (path: string, offset: number, size: number): Promise<ParsedMail> {
  const mbox = await open(path, 'r')
  const {
    buffer: contents,
    bytesRead
  } = await mbox.read({
    buffer: Buffer.alloc(size),
    length: size,
    offset: 0,
    position: offset
  })
  await mbox.close()

  if (bytesRead !== size) {
    throw new Error(`Unable to read ${size} bytes, only got ${bytesRead}.`)
  }

  return await simpleParser(contents, {
    skipTextToHtml: true
  })
}
