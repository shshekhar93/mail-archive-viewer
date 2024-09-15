import { KeyboardEvent, useCallback, useEffect } from "react";
import { useStore } from "./state";
import { useParams } from "wouter";

export function useSetupFilters() {
  const filters = useStore(state => state.filters);
  const filter = useStore(state => state.filter);
  const mailboxes = useStore(state => state.mailboxes);
  const params = useParams();

  useEffect(() => {
    const mailboxId = +(params.id ?? 0);

    if(mailboxId !== filters.mailboxId) {
      const { labels } = mailboxes.find(({ id }) => mailboxId === id) ?? {};

      filter({ mailboxId, label: labels?.[0]?.id ?? 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useEnterPressDetection(onEnterPressed: (elem: HTMLElement) => void) {
  return useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      onEnterPressed(e.currentTarget);
    }
  }, [onEnterPressed]);
};
