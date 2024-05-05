import React, { useCallback, useMemo, useState } from "react";
import { useStore } from "../../lib/state"

export function MailboxLeftNav() {
  const [expanded, setExpanded] = useState(false);
  const mailboxId = useStore(state => state.filters.mailboxId);
  const mailboxes = useStore(state => state.mailboxes);

  const [shownLabels, collapsableLabels] = useMemo(() => {
    const { labels = [] } = mailboxes.find(({ id }) => id === mailboxId) ?? {};

    return [labels.slice(0, 4), labels.slice(4)];
  }, [mailboxes, mailboxId]);

  const toggle = useCallback((e: React.MouseEvent) => {
    console.log('toggling');
    e.preventDefault();
    setExpanded(e => !e);
  }, [])

  return (
    <div className="left-nav">
      <ul>
        {shownLabels.map(({label}) => <li key={label}>{label}</li>)}
        {collapsableLabels.length > 0 && <>
          <a href="#" onClick={toggle}>{expanded ? 'Hide labels' : 'Show more'}</a>
          {expanded && collapsableLabels.map(({label}) => <li key={label}>{label}</li>)}
        </>}
      </ul>
    </div>
  )
}
