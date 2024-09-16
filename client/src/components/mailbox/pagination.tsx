import { ChangeEvent, MouseEvent, useCallback } from "react";
import { useStore } from "../../lib/state";
import { useEnterPressDetection } from "../../lib/hooks";

export function EmailsHeader() {
  return (
    <div className="emails-header">
      <div className="flex-filler" />
      <EmailsPagination />
    </div>
  )
}

export function EmailsPagination() {
  const limit = useStore(state => state.filters.limit);
  const offset = useStore(state => state.filters.offset);
  const numMails = useStore(state => state.mails.length);
  const totalMails = useStore(state => state.totalCount);
  const filter = useStore(state => state.filter);

  const updatePageSize = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    filter({
      limit: +e.target.value,
      offset: 0
    })
  }, [filter]);

  const changePage = useCallback((elem: HTMLElement) => {
    if(elem.classList.contains('disabled')) {
      return;
    }

    const action = elem.getAttribute('data-action');
    const newOffset = action === 'previous' ? Math.max(offset - limit, 0) : offset + limit;
    filter({
      offset: newOffset,
    });
  },[filter, offset, limit]);

  const onPageChange = useCallback((e: MouseEvent<HTMLElement>) => changePage(e.currentTarget), [changePage]);
  const onKeyUp = useEnterPressDetection(changePage);

  const hasPreviousPage = offset > 0;
  const hasNextPage = (offset + numMails) < totalMails;

  return (
    <div className="emails-pagination">
      <select className="emails-page-size" value={limit} onChange={updatePageSize}>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
      <span
        tabIndex={hasPreviousPage ? 0 : -1}
        data-action="previous"
        onClick={onPageChange}
        onKeyUp={onKeyUp}
        className={`icon-button ${hasPreviousPage ? '' : 'disabled'}`}
      >◀</span>
      <span>{offset + 1} - {offset + numMails} of {totalMails}</span>
      <span 
        tabIndex={hasNextPage ? 0 : -1}
        data-action="next"
        onClick={onPageChange}
        onKeyUp={onKeyUp}
        className={`icon-button ${hasNextPage ? '' : 'disabled'}`}
      >▶</span>
    </div>
  );
}
