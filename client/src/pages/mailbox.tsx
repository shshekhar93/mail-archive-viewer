import { Redirect, Route } from "wouter";
import { useStore } from "../lib/state"
import { MailboxList } from "../components/mailbox/list";
import { MailboxSection } from "../components/mailbox";
import { MailboxPageLayout } from "../components/layout";
import { useSetupFilters } from "../lib/hooks";
import { EmailViewer } from "../components/mailbox/email-viewer";

export function MailboxListPage() {
  const filters = useStore(state => state.filters);

  if(filters.mailboxId > 0) {
    return (
      <Redirect to={`/mailbox/${filters.mailboxId}`} />
    );
  }

  return (
    <MailboxList />
  )
}

export function MailBoxPage() {
  useSetupFilters();

  return (
    <MailboxPageLayout>
      <Route path="/" component={MailboxSection} />
      <Route path="/mail/:mailId" component={EmailViewer} />
    </MailboxPageLayout>
  );
}
