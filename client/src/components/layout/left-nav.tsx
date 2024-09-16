import React, { useCallback, useMemo, useState } from "react";
import { useStore } from "../../lib/state"
import { useEnterPressDetection } from "../../lib/hooks";

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

  const onLabelSelect = useCallback((elem: HTMLElement) => {
    const labelId = +(elem.getAttribute('data-label-id') ?? '1');

    filter({
      label: labelId,
    });
  }, [filter]);

  const navigateTo = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    onLabelSelect(e.currentTarget);
  }, [onLabelSelect]);

  
  const onKeyUp = useEnterPressDetection(onLabelSelect);

  return (
    <div className="left-nav">
      <ul>
        <li
          tabIndex={0}
          className={selectedLabelId === 0 ? 'active': ''} 
          data-label-id={0} 
          onClick={navigateTo}
          onKeyUp={onKeyUp}>
          All Mails
        </li>
        {shownLabels.map(({id, label}) => 
          <li
            tabIndex={0}
            key={id} 
            className={getLiClassName(id, selectedLabelId)} 
            data-label-id={id} 
            onClick={navigateTo}
            onKeyUp={onKeyUp}>
            {label}
          </li>
        )}
        {collapsableLabels.length > 0 && <>
          <a href="#toggle-labels" onClick={toggle}>{expanded ? 'Hide labels' : 'Show more'}</a>
          {expanded && collapsableLabels.map(({id, label}) => 
            <li
              tabIndex={0}
              key={id} 
              className={getLiClassName(id, selectedLabelId)} 
              data-label-id={id} 
              onClick={navigateTo}
              onKeyUp={onKeyUp}>
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
