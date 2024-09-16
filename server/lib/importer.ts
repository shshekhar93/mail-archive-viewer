import { simpleParser } from 'mailparser'
import { MboxParser } from './mbox-parser'
import { CONTENT_LANGUAGE, KEYWORD_SERACH_LENGTH, KEYWORDS_FILTER, MAX_KEYWORD_LENGTH, MIN_KEYWORD_LENGTH, X_GMAIL_LABELS, X_GMAIL_THREAD_ID } from './constants'
import { Keyword, Label, Mail, Mailbox, Recipient, sequelize } from './db'
import { parse } from 'path'
import keyword_extractor from 'keyword-extractor'
import { type LanguageName } from 'keyword-extractor/types/lib/keyword_extractor'
import { normalizeKeyword } from './utils'
import { type Transaction } from 'sequelize'
import pMap from 'p-map'

export async function importMbox (path: string): Promise<void> {
  const findOrCreateLabel = async (mailboxId: number, label: string, transaction: Transaction): Promise<Label> => {
    return await Label.findOrCreate({
      where: {
        label,
        mailboxId
      },
      transaction
    }).then(([label]) => label)
  }

  const findOrCreateKeyword = async (keyword: string, transaction: Transaction): Promise<Keyword> => {
    return await Keyword.findOrCreate({
      where: {
        keyword
      },
      transaction
    }).then(([keyword]) => keyword)
  }

  await new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        const { name } = parse(path)

        const [mailBox] = await Mailbox.findOrCreate({
          where: {
            path
          },
          defaults: {
            name,
            path,
            parsed: false,
            parsedBytes: 0
          }
        })

        if (mailBox.parsed) {
          // The mailbox file has already been parsed
          resolve(); return
        }

        const parser = new MboxParser(path, mailBox.parsedBytes)
        parser.on('error', (err) => {
          reject(err)
        })

        parser.on('end', async () => {
          mailBox.parsed = true
          await mailBox.save()

          resolve()
        })

        parser.on('data', async (buf, offset) => {
          parser.pause()
          // save data.
          const parsed = await simpleParser(buf, {
            skipTextToHtml: true,
            skipTextLinks: true
          })

          const threadId = parsed.headers.get(X_GMAIL_THREAD_ID)?.toString() ?? ''
          const hasAttachments = !(parsed.attachments.length === 0)

          const transaction = await sequelize.transaction()

          try {
            // Save the labels
            const labelStr = parsed.headers.get(X_GMAIL_LABELS)
            const labels = typeof labelStr === 'string' ? labelStr.split(',') : []
            const isSentEmail = labels.includes('Sent')
            const labelModels = await pMap(
              labels,
              async label => await findOrCreateLabel(mailBox.id, label, transaction),
              { concurrency: 5 }
            )

            // Save the recipients
            const recipientsArr = Array.isArray(parsed.to) ? parsed.to.flatMap(({ value }) => value) : parsed.to?.value
            const recipients = recipientsArr?.map(recipient => ({
              name: recipient.name ?? '',
              email: recipient.address ?? ''
            })) ?? []
            const recipientModels = await pMap(
              recipients,
              async recipient => await Recipient.create(recipient, { transaction }),
              { concurrency: 5 }
            )

            // Save the keywords
            const language = (parsed.headers.get(CONTENT_LANGUAGE)?.toString()?.substring(0, 2)?.toLowerCase() as LanguageName)
            let text = parsed.text ?? ''
            const html = parsed.html ?? ''
            if (text === '' && html !== false && html !== '') {
              text = html.replace(/<[^>]+>/g, '')
            }

            if ((text.length ?? 0) > KEYWORD_SERACH_LENGTH) {
              const nextSpace = text.indexOf(' ', KEYWORD_SERACH_LENGTH)
              const endOfLine = text.indexOf('\n', KEYWORD_SERACH_LENGTH)
              text = text.substring(0, nextSpace !== -1 ? nextSpace : (endOfLine !== -1 ? endOfLine : KEYWORD_SERACH_LENGTH))
            }

            const keywords = new Set(keyword_extractor.extract(text, {
              language,
              remove_digits: true,
              return_changed_case: true,
              remove_duplicates: true
            }).filter(
              keyword => (
                keyword.length >= MIN_KEYWORD_LENGTH &&
                keyword.length <= MAX_KEYWORD_LENGTH &&
                KEYWORDS_FILTER.test(keyword)
              )
            ).map(normalizeKeyword))

            const keywordModels = await pMap(
              keywords,
              async keyword => await findOrCreateKeyword(keyword, transaction),
              { concurrency: 10 }
            )

            const mailModel = await Mail.create({
              threadId,
              hasAttachments,
              messageId: parsed.messageId,
              fileOffset: offset,
              size: buf.byteLength,
              messageTime: parsed.date ?? new Date(0),
              senderEmail: parsed.from?.value?.[0].address ?? '',
              senderName: parsed.from?.value?.[0].name ?? '',
              subject: parsed.subject ?? '<No subject>',
              mailboxId: mailBox.id,
              isSentEmail
            }, { transaction });
            (labelModels.length > 0) && await mailModel.addLabels(labelModels, { transaction })
            ;(recipientModels.length > 0) && await mailModel.addRecipients(recipientModels, { transaction })
            ;(keywordModels.length > 0) && await mailModel.addKeywords(keywordModels, { transaction })

            mailBox.parsedBytes = offset + buf.byteLength
            await mailBox.save({ transaction })

            await transaction.commit()
          } catch (e: any) {
            console.error('Failed to save email', e.stack)
            await transaction.rollback()
          }

          parser.resume()
        })
      } catch (e) {
        reject(e)
      }
    })().catch((err: Error) => {
      console.log(`Someting went wrong: ${err.stack}`)
    })
  })
};
