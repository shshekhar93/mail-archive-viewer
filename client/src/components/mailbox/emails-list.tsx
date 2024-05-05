import { useStore } from "../../lib/state";
import { Email } from "./email";

export function EmailsList() {
  const mails = useStore(filters => filters.mails);

  if(mails.length === 0) {
    return <p>It's loney in here.</p>;
  }

  return (
    <ul className="mailbox-contents">
      {
        mails.map(((mail, idx) => (
          <Email mail={mail} />
        )))
      }
    </ul>
  );
}
