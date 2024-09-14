import { MailT } from "../../../lib/state"
import { contactToDisplayStr, mailToTimeDisplay } from "../../../lib/utils";

export type EmailContactViewPropsT = {
  mail: MailT;
};

export function EmailContactView({ mail }: EmailContactViewPropsT) {
  return (
    <div className="details-container">
      <div className="contacts-container">
        <div className="sender-details">
          {!!mail.senderName && <span>{mail.senderName}</span>}
          <span>&lt;{mail.senderEmail}&gt;</span>
        </div>
        <div className="recipient-details">
          <span>to {mail.recipients.map(recipient => contactToDisplayStr(recipient)).join(', ')}</span>
        </div>
      </div>
      <div className="timestamp">
        {mailToTimeDisplay(mail, true)}
      </div>
    </div>
  );
}
