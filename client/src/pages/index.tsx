import { Redirect, Route, Router, Switch } from "wouter";
import { StateT, useStoreShallow } from "../lib/state";
import { useEffect } from "react";
import { MailBoxPage, MailboxListPage } from "./mailbox";

export function AllPages() {
  const [ready, bootstrap] = useStoreShallow<[boolean, StateT['bootstrap']]>(['bootstrapComplete', 'bootstrap']);

  useEffect(() => {
    bootstrap();
  }, []);

  if(!ready) {
    return <span>Loading...</span>;
  }

  return (
    <Router>
      <Switch>
        <Route path="/" component={() => <Redirect to="/mailbox" />} />
        <Route path="/mailbox" component={MailboxListPage} />
        <Route path="/mailbox/:id" component={MailBoxPage}/>
        <Route path="/settings" />
      </Switch>
    </Router>
  );
}
