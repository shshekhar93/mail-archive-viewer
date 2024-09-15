import { ContactT, MailT } from "./state";

export function toQuery(obj: Record<string, string>): string {
  const searchParams = new URLSearchParams(obj);
  for(const [key, value] of searchParams.entries()) {
    if (value === '') {
      searchParams.delete(key)
    }
  }
  return searchParams.toString();
}

export function contactToDisplayStr({ name, email }: ContactT): string {
  let displayStr = name;
  if(!displayStr && email) {
    displayStr = email.split('@')[0]
  }

  return displayStr;
}

export function mailToContactDisplay(mail: MailT): string {
  if(mail.isSentEmail) {
    return `To: ${contactToDisplayStr(mail.recipients[0] || {})}`;
  }
  
  return contactToDisplayStr({
    name: mail.senderName,
    email: mail.senderEmail,
  });
}

const timeFormatter = Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

const DDMMFormatter = Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
});

const DateFormatter = Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

const LongDateTimeFormatter = Intl.DateTimeFormat(undefined, {
  weekday: 'short', 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: 'numeric', 
  minute: 'numeric'
});

const CUR_YEAR = new Date().getFullYear();
const MSECS_IN_A_DAY = 24 * 60 * 60 * 1000; 

export function mailToTimeDisplay(mail: MailT, longFormat: boolean = false): string {
  const messageTime = mail.messageTime;
  if(longFormat) {
    return LongDateTimeFormatter.format(messageTime);
  }

  if((+messageTime - MSECS_IN_A_DAY) > Date.now()) {
    return timeFormatter.format(messageTime);
  }

  if(messageTime.getFullYear() === CUR_YEAR) {
    return DDMMFormatter.format(messageTime);
  }

  return DateFormatter.format(messageTime);
}