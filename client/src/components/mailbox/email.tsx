import { useCallback } from "react";
import { MailT, useStore } from "../../lib/state";
import { mailToContactDisplay, mailToTimeDisplay } from "../../lib/utils";
import { useEnterPressDetection } from "../../lib/hooks";

type EamilProps = {
  mail: MailT;
};

export function Email({mail}: EamilProps) {
  const openMail = useStore(state => state.openMail);
  const onSelect = useCallback(() => openMail(mail), [openMail, mail]);
  const onKeyUp = useEnterPressDetection(onSelect);

  return (
    <li className="mailbox-email" key={mail.id} onClick={onSelect} onKeyUp={onKeyUp} tabIndex={0}>
      <div className="mailbox-email-contact">{mailToContactDisplay(mail)}</div>
      <div className="mailbox-email-content">{mail.subject}</div>
      <div className="mailbox-email-date">{mailToTimeDisplay(mail)}</div>
    </li>
  )
}