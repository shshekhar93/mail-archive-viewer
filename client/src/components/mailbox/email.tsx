import { MailT, useStore } from "../../lib/state";
import { mailToContactDisplay, mailToTimeDisplay } from "../../lib/utils";

type EamilProps = {
  mail: MailT;
};

export function Email({mail}: EamilProps) {
  const openMail = useStore(state => state.openMail);

  return (
    <li className="mailbox-email" key={mail.id} onClick={() => openMail(mail)}>
      <div className="mailbox-email-contact">{mailToContactDisplay(mail)}</div>
      <div className="mailbox-email-content">{mail.subject}</div>
      <div className="mailbox-email-date">{mailToTimeDisplay(mail)}</div>
    </li>
  )
}