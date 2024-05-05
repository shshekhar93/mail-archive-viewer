import { useEffect } from "react";
import { useStore } from "./state";
import { useParams } from "wouter";

export function useSetupFilters() {
  const filters = useStore(state => state.filters);
  const filter = useStore(state => state.filter);
  const params = useParams();

  useEffect(() => {
    const mailboxId = +(params.id ?? 0);

    if(mailboxId !== filters.mailboxId) {
      filter({ mailboxId });
    }
  }, []);
}