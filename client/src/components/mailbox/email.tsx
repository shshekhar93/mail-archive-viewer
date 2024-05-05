import { MailT } from "../../lib/state";
import { mailToContactDisplay, mailToTimeDisplay } from "../../lib/utils";

type EamilProps = {
  mail: MailT;
};

export function Email({mail}: EamilProps) {
  return (
    <li className="mailbox-email" key={mail.id}>
      <div className="mailbox-email-contact">{mailToContactDisplay(mail)}</div>
      <div className="mailbox-email-content">{mail.subject}</div>
      <div className="mailbox-email-date">{mailToTimeDisplay(mail)}</div>
    </li>
  )
}