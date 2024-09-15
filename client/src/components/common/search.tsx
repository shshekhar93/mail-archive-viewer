import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useStore } from "../../lib/state";
import "./search.css";
import { useEnterPressDetection } from "../../lib/hooks";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const filter = useStore(state => state.filter);

  const updateSearchTerm = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const keyUp = useEnterPressDetection(useCallback(() => {
    filter({
      search: searchTerm,
    });
  }, [searchTerm, filter]));

  const detectClear = useCallback((e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.value !== '') {
      return;
    }

    filter({ search: '' });
  }, [filter]);

  return (
    <input
      type="search"
      className="search-bar"
      placeholder="Enter search terms..."
      value={searchTerm}
      onChange={updateSearchTerm}
      onKeyUp={keyUp}
      onInput={detectClear} />
  );
}