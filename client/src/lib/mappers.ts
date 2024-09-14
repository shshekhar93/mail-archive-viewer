export function mailMapper<T extends {[k : string]: any, messageTime: any}>(mail: T): Omit<T, 'messageTime'> & {messageTime: Date} {
  return {
    ...mail,
    messageTime: new Date(mail.messageTime),
  }
}