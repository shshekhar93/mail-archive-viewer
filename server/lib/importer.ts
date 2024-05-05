import { simpleParser } from 'mailparser'
import { MboxParser } from './mbox-parser'
import { CONTENT_LANGUAGE, KEYWORD_SERACH_LENGTH, KEYWORDS_FILTER, MAX_KEYWORD_LENGTH, MIN_KEYWORD_LENGTH, X_GMAIL_LABELS, X_GMAIL_THREAD_ID } from './constants'
import { Keyword, Label, Mail, Mailbox, Recipient } from './db'
import { parse } from 'path'
import keyword_extractor from 'keyword-extractor'
import { type LanguageName } from 'keyword-extractor/types/lib/keyword_extractor'

export async function importMbox (path: string): Promise<void> {
  const findOrCreateLabel = async (mailboxId: number, label: string): Promise<Label> => {
    return await Label.findOrCreate({
      where: {
        label,
        mailboxId
      }
    }).then(([label]) => label)
  }

  await new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        const { name } = parse(path)

        const mailBox = await Mailbox.create({
          name,
          path
        })

        const parser = new MboxParser(path)
        parser.on('error', (err) => {
          reject(err)
        })

        parser.on('end', () => {
          resolve()
        })

        parser.on('data', async (buf, offset) => {
          parser.pause()
          // save data.
          const parsed = await simpleParser(buf, {
            skipTextToHtml: true,
            skipTextLinks: true
          })
          console.log('shshekhar:::: email parsing started', parsed.messageId)

          const threadId = parsed.headers.get(X_GMAIL_THREAD_ID)?.toString() ?? ''
          const hasAttachments = !(parsed.attachments.length === 0)
          let isSentEmail = false

          // Save the labels
          const labelStr = parsed.headers.get(X_GMAIL_LABELS)
          const labels = typeof labelStr === 'string' ? labelStr.split(',') : []
          const labelModels = []
          for (const label of labels) {
            labelModels.push(await findOrCreateLabel(mailBox.id, label))
            if (label === 'Sent') {
              isSentEmail = true
            }
          }

          // Save the recipients
          const recipientsArr = Array.isArray(parsed.to) ? parsed.to.flatMap(({ value }) => value) : parsed.to?.value
          const recipients = recipientsArr?.map(recipient => ({
            name: recipient.name ?? '',
            email: recipient.address ?? ''
          })) ?? []
          const recipientModels = []
          for (const recipient of recipients) {
            recipientModels.push(await Recipient.create(recipient))
          }

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

          const keywords = keyword_extractor.extract(text, {
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
          )

          const keywordModels = []
          for (const keyword of keywords) {
            keywordModels.push(await Keyword.create({ keyword }))
          }

          const mailModel = await Mail.create({
            threadId,
            hasAttachments,
            messageId: parsed.messageId,
            fileOffset: offset,
            messageTime: parsed.date ?? new Date(0),
            senderEmail: parsed.from?.value?.[0].address ?? '',
            senderName: parsed.from?.value?.[0].name ?? '',
            subject: parsed.subject ?? '<No subject>',
            mailboxId: mailBox.id,
            isSentEmail
          });
          (labelModels.length > 0) && await mailModel.addLabels(labelModels)
          ;(recipientModels.length > 0) && await mailModel.addRecipients(recipientModels)
          ;(keywordModels.length > 0) && await mailModel.addKeywords(keywordModels)

          // console.log('Mail saved: ' + parsed.subject);
          console.log('shshekhar:::: email parsing ended')
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
