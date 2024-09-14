import { useEffect } from "react";
import { useStore } from "../../lib/state";

export function MailboxList() {
  const mailboxes = useStore(state => state.mailboxes);
  const filter = useStore(state => state.filter);

  useEffect(() => {
    if(mailboxes.length === 1) {
      filter({
        mailboxId: mailboxes[0].id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only required on first render
  }, []);

  return (
    <ul>
      {mailboxes.map(({ displayName, name, id }) => (
        <li key={id}>{displayName ?? name}</li>
      ))}
    </ul>
  )
};
