import { Router } from 'express'
import { Keyword, Label, Mail, Mailbox, Recipient } from '../lib/db'
import { normalizeKeyword, readMailFromMbox, sortLabels } from '../lib/utils'
import { type Includeable, Op } from 'sequelize'

const mailRouter = Router()

mailRouter.get('/mailbox', async (req, res) => {
  const mailboxes = (await Mailbox.findAll({
    include: [{
      model: Label,
      as: 'labels',
      attributes: ['id', 'label']
    }]
  })).map(mailbox => ({
    ...mailbox.toJSON(),
    labels: sortLabels(mailbox.labels)
  }))

  res.send(mailboxes)
})

mailRouter.get('/mailbox/:id', async (req, res) => {
  const { search, label } = req.query
  const searchQueries = ((typeof search === 'string' && search !== '') ? search.split(/\s+/) : [])
    .map(normalizeKeyword)
    .map(keyword => ({ keyword: { [Op.like]: `%${keyword}%` } }))

  const includes: Includeable[] = [{
    model: Recipient,
    as: 'recipients',
    attributes: ['name', 'email']
  }]

  if (searchQueries.length > 0) {
    includes.push({
      model: Keyword,
      as: 'keywords',
      attributes: [],
      where: {
        [Op.or]: searchQueries
      }
    })
  }

  if (label !== undefined && label !== '0' && !isNaN(+label)) {
    includes.push({
      model: Label,
      as: 'labels',
      attributes: ['id', 'label'],
      through: {
        attributes: []
      },
      where: {
        id: +label
      }
    })
  }

  const { count, rows: mails } = await Mail.findAndCountAll({
    distinct: true,
    where: {
      mailboxId: req.params.id
    },
    include: includes,
    limit: +(req.query.limit ?? 100),
    offset: +(req.query.offset ?? 0),
    order: [
      ['messageTime', 'DESC']
    ]
  })

  res.send({
    mails,
    count
  })
})

mailRouter.get('/mail/:id', async (req, res) => {
  const mail = await Mail.findByPk(+req.params.id, {
    include: [{
      model: Label,
      as: 'labels',
      attributes: ['id', 'label'],
      through: {
        attributes: []
      }
    }, {
      model: Recipient,
      as: 'recipients',
      attributes: ['name', 'email']
    }, {
      model: Mailbox
    }]
  })

  const { path } = mail?.Mailbox ?? {}
  const { fileOffset, size } = mail ?? {}
  if (path === undefined || fileOffset === undefined || size === undefined) {
    return res.status(500).send({
      ok: false,
      error: 'Invalid metadata'
    })
  }

  const parsedMail = await readMailFromMbox(path, fileOffset, size)
  const isPlainText = parsedMail.html === '' || parsedMail.html === false
  const content = isPlainText ? parsedMail.text : parsedMail.html

  const attachments = parsedMail.attachments
    .filter(({ related }) => !related)
    .map(attachment => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      content: attachment.content.toString('base64')
    }))

  res.send({
    ...mail?.toJSON(),
    contentType: isPlainText ? 'text/plain' : 'text/html',
    content,
    attachments
  })
})

export { mailRouter }
