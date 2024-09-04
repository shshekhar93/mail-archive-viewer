import { EmailViewer } from "./email-viewer";
import { EmailsList } from "./emails-list";
import "./mailbox.css";

export function MailboxSection() {
  return (
    <>
      <EmailsList />

      {/*@ts-ignore*/}
      <EmailViewer />
    </>
  )
}