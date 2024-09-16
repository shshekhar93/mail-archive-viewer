import { useStore } from "../../lib/state";
import { Email } from "./email";
import { EmailsHeader } from "./pagination";

export function EmailsList() {
  const mails = useStore(filters => filters.mails);

  if(mails.length === 0) {
    return <p>It's loney in here.</p>;
  }

  return (
    <div className="emails-list-container">
      <EmailsHeader />
      <ul className="mailbox-contents">
        {
          mails.map(((mail) => (
            <Email key={mail.id} mail={mail} />
          )))
        }
      </ul>
    </div>
  );
}
