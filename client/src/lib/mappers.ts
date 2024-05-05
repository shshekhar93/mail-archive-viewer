import { MailT } from "./state";

export function mailMapper(mail: any): MailT {
  return {
    ...(mail as MailT),
    messageTime: new Date(mail.messageTime),
  }
}