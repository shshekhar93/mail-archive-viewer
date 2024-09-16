import { type Association, type CreationOptional, DataTypes, type ForeignKey, type HasManyAddAssociationMixin, type HasManyAddAssociationsMixin, type InferAttributes, type InferCreationAttributes, Model, type NonAttribute, Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/mnt/c/Users/Shashi/Downloads/data.db',
  logging: true
})

export class Mailbox extends Model<InferAttributes<Mailbox>, InferCreationAttributes<Mailbox>> {
  declare id: CreationOptional<number>
  declare name: string
  declare path: string
  declare parsed: boolean
  declare parsedBytes: number

  // Inclusions
  declare labels: NonAttribute<Label[]>

  // associations
  declare static associations: {
    labels: Association<Mailbox, Label>
  }

  declare addLabels: HasManyAddAssociationsMixin<Label, number>
  declare addMail: HasManyAddAssociationMixin<Mail, number>
  declare addMails: HasManyAddAssociationsMixin<Mail, number>
}

Mailbox.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  path: DataTypes.STRING,
  parsed: DataTypes.BOOLEAN,
  parsedBytes: DataTypes.INTEGER.UNSIGNED
}, {
  sequelize,
  tableName: 'mailbox',
  indexes: [
    {
      unique: true,
      fields: ['path']
    }
  ]
})

export class Mail extends Model<InferAttributes<Mail>, InferCreationAttributes<Mail>> {
  declare id: CreationOptional<number>
  declare messageId: string | undefined
  declare threadId: string
  declare messageTime: Date
  declare subject: string
  declare senderName: string
  declare senderEmail: string
  declare hasAttachments: boolean
  declare fileOffset: number
  declare size: number
  declare isSentEmail: boolean

  declare mailboxId: ForeignKey<Mailbox['id']>

  // Inclusions
  declare labels: NonAttribute<Label[]>
  declare recipents: NonAttribute<Recipient[]>
  declare Mailbox: NonAttribute<Mailbox>

  // Associatitons
  declare static associations: {
    labels: Association<Mail, Label>
    recipients: Association<Mail, Recipient>
    keywords: Association<Mail, Keyword>
  }

  declare addLabels: HasManyAddAssociationsMixin<Label, number>
  declare addRecipients: HasManyAddAssociationsMixin<Recipient, number>
  declare addKeywords: HasManyAddAssociationsMixin<Keyword, number>
}

Mail.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  messageId: DataTypes.TEXT,
  threadId: DataTypes.TEXT,
  messageTime: DataTypes.DATE,
  subject: DataTypes.TEXT,
  senderName: DataTypes.TEXT,
  senderEmail: DataTypes.TEXT,
  hasAttachments: DataTypes.BOOLEAN,
  fileOffset: DataTypes.INTEGER,
  size: DataTypes.INTEGER,
  isSentEmail: DataTypes.BOOLEAN
}, {
  sequelize,
  tableName: 'mails',
  indexes: [
    {
      unique: true,
      fields: ['messageId']
    },
    {
      using: 'BTREE',
      fields: ['threadId']
    },
    {
      using: 'BTREE',
      fields: ['senderEmail']
    },
    {
      using: 'BTREE',
      fields: ['senderName']
    }
  ]
})

export class Recipient extends Model<InferAttributes<Recipient>, InferCreationAttributes<Recipient>> {
  declare id: CreationOptional<number>
  declare name: string | undefined
  declare email: string

  declare mailId: ForeignKey<Mail['id']>
}

Recipient.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING
}, {
  sequelize,
  tableName: 'recipients',
  indexes: [
    {
      using: 'BTREE',
      fields: ['name']
    },
    {
      using: 'BTREE',
      fields: ['email']
    }
  ]
})

export class Label extends Model<InferAttributes<Label>, InferCreationAttributes<Label>> {
  declare id: CreationOptional<number>
  declare label: string

  declare mailboxId: ForeignKey<Mailbox['id']>
}

Label.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  label: DataTypes.STRING
}, {
  sequelize,
  tableName: 'labels',
  indexes: [
    {
      unique: true,
      using: 'BTREE',
      fields: ['mailBoxId', 'label']
    }
  ]
})

export class Keyword extends Model<InferAttributes<Keyword>, InferCreationAttributes<Keyword>> {
  declare id: CreationOptional<number>
  declare keyword: string
}

Keyword.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  keyword: DataTypes.STRING
}, {
  sequelize,
  tableName: 'keywords',
  indexes: [
    {
      using: 'BTREE',
      fields: ['keyword']
    }
  ]
})

// MailBox : Mail ?? One -> Many
Mailbox.hasMany(Mail, {
  as: 'mails',
  sourceKey: 'id',
  foreignKey: 'mailboxId'
})
Mail.belongsTo(Mailbox, {
  targetKey: 'id',
  foreignKey: 'mailboxId'
})

// Mailbox : Label ?? One -> Many
Mailbox.hasMany(Label, {
  as: 'labels',
  sourceKey: 'id',
  foreignKey: 'mailboxId'
})
Label.belongsTo(Mailbox, {
  targetKey: 'id',
  foreignKey: 'mailboxId'
})

// Mail : Recipient ?? One -> Many
Mail.hasMany(Recipient, {
  as: 'recipients',
  sourceKey: 'id',
  foreignKey: 'mailId'
})
Recipient.belongsTo(Mail, {
  targetKey: 'id',
  foreignKey: 'mailId'
})

// Mail : Keyword ?? Many -> Many
Mail.belongsToMany(Keyword, {
  through: 'MailAndKeyword',
  as: 'keywords',
  foreignKey: 'mailId',
  otherKey: 'keywordId'
})
Keyword.belongsToMany(Mail, {
  through: 'MailAndKeyword',
  as: 'mails',
  foreignKey: 'keywordId',
  otherKey: 'mailId'
})

// Mail : Label ?? Many <-> Many
Mail.belongsToMany(Label, {
  through: 'MailAndLabel',
  as: 'labels',
  foreignKey: 'mailId',
  otherKey: 'labelId'
})
Label.belongsToMany(Mail, {
  through: 'MailAndLabel',
  as: 'mails',
  foreignKey: 'labelId',
  otherKey: 'mailId'
})

export async function connectAndSync (): Promise<void> {
  await sequelize.authenticate()
  await sequelize.sync()
};
