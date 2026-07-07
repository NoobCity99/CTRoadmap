import { Search, X } from "lucide-react";
import type { RefObject } from "react";

interface SearchBoxProps {
  inputRef: RefObject<HTMLInputElement>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchBox({ inputRef, searchTerm, onSearchChange }: SearchBoxProps) {
  return (
    <div className="search-box">
      <Search size={18} />
      <input ref={inputRef} value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search tiles..." />
      {searchTerm ? (
        <button
          className="search-box__clear"
          type="button"
          aria-label="Clear search"
          title="Clear search"
          onClick={() => {
            onSearchChange("");
            inputRef.current?.focus();
          }}
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}
