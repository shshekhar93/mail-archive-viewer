import { Router } from 'express'
import { Keyword, Label, Mail, Mailbox, Recipient } from '../lib/db'
import { sortLabels } from '../lib/utils'

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
  const searchTerms = (typeof search === 'string' && search !== '') ? search.split(/\s+/) : []

  const mails = await Mail.findAll({
    where: {
      mailboxId: req.params.id
    },
    include: [{
      model: Label,
      as: 'labels',
      attributes: ['id', 'label'],
      through: {
        attributes: []
      },
      where: {
        ...(typeof label === 'string' ? { id: +label } : {})
      }
    }, {
      model: Recipient,
      as: 'recipients',
      attributes: ['name', 'email']
    }, {
      model: Keyword,
      as: 'keywords',
      attributes: [],
      where: {
        ...((searchTerms.length > 0) ? { keyword: searchTerms } : {})
      }
    }],
    limit: +(req.query.limit ?? 100),
    offset: +(req.query.offset ?? 0),
    order: [
      ['messageTime', 'DESC']
    ]
  })

  res.send(mails)
})

mailRouter.get('/mail/:id', (req, res) => {
  res.send({})
})

export { mailRouter }
