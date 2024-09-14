import React, { useCallback, useMemo, useState } from "react";
import { useStore } from "../../lib/state"

export function MailboxLeftNav() {
  const mailboxId = useStore(state => state.filters.mailboxId);
  const mailboxes = useStore(state => state.mailboxes);
  const selectedLabelId = useStore(state => state.filters.label);
  const filter = useStore(state => state.filter);

  const [shownLabels, collapsableLabels] = useMemo(() => {
    const { labels = [] } = mailboxes.find(({ id }) => id === mailboxId) ?? {};

    return [labels.slice(0, 4), labels.slice(4)];
  }, [mailboxes, mailboxId]);
  
  const [expanded, setExpanded] = useState(() => collapsableLabels.some(({id}) => id === selectedLabelId));

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(e => !e);
  }, []);

  const navigateTo = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    const labelId = +(e.currentTarget.getAttribute('data-label-id') ?? '1');

    filter({
      label: labelId,
    });
  }, [filter]);

  return (
    <div className="left-nav">
      <ul>
        {shownLabels.map(({id, label}) => 
          <li
            key={id} 
            className={getLiClassName(id, selectedLabelId)} 
            data-label-id={id} 
            onClick={navigateTo}>
            {label}
          </li>
        )}
        {collapsableLabels.length > 0 && <>
          <a href="#toggle-labels" onClick={toggle}>{expanded ? 'Hide labels' : 'Show more'}</a>
          {expanded && collapsableLabels.map(({id, label}) => 
            <li
              key={id} 
              className={getLiClassName(id, selectedLabelId)} 
              data-label-id={id} 
              onClick={navigateTo}>
              {label}
            </li>
          )}
        </>}
      </ul>
    </div>
  )
}

function getLiClassName(labelId: number, selectedLabelId: number) {
  return labelId === selectedLabelId ? 'active' : '';
}
