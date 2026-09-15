"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { searchUsers, type CommitteePerson } from "@/services/categoryService";
import styles from "./UserSearchPicker.module.css";

interface UserSearchPickerProps {
  label: string;
  selected: CommitteePerson[];
  onChange: (users: CommitteePerson[]) => void;
  maxSelections: number;
  disabled?: boolean;
}

export function UserSearchPicker({
  label,
  selected,
  onChange,
  maxSelections,
  disabled = false,
}: UserSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommitteePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const selectedIds = new Set(selected.map((u) => u.user_id));
        const users = await searchUsers(query.trim());
        setResults(users.filter((u) => !selectedIds.has(u.user_id)));
        setOpen(true);
      } catch {
        setSearchError("Search unavailable. Please check your connection.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  const select = (user: CommitteePerson) => {
    if (selected.length >= maxSelections) return;
    if (selected.some((u) => u.user_id === user.user_id)) return;
    onChange(maxSelections === 1 ? [user] : [...selected, user]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const remove = (userId: string) => {
    onChange(selected.filter((u) => u.user_id !== userId));
  };

  const atMax = selected.length >= maxSelections;

  return (
    <div className={styles.root} ref={containerRef}>
      <p className={styles.label}>{label}</p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className={styles.chips}>
          {selected.map((u) => (
            <span key={u.user_id} className={styles.chip}>
              <span className={styles.chipInfo}>
                <span className={styles.chipName}>{u.name}</span>
                <span className={styles.chipEmail}>{u.email}</span>
              </span>
              {!disabled && (
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => remove(u.user_id)}
                  title={`Remove ${u.name}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input — hidden when at max in single-select mode */}
      {!disabled && !(atMax && maxSelections === 1) && (
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              atMax
                ? `Maximum ${maxSelections} users selected`
                : "Search by name or email…"
            }
            disabled={atMax}
            autoComplete="off"
          />
          {loading && <Loader2 size={14} className={styles.spinner} />}
        </div>
      )}

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((u) => (
            <li key={u.user_id}>
              <button
                type="button"
                className={styles.option}
                onClick={() => select(u)}
              >
                <span className={styles.optionName}>{u.name}</span>
                <span className={styles.optionEmail}>{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim().length > 0 && !searchError && (
        <p className={styles.empty}>No users found for &ldquo;{query}&rdquo;</p>
      )}

      {searchError && <p className={styles.error}>{searchError}</p>}

      {maxSelections > 1 && (
        <p className={styles.hint}>
          {selected.length} / {maxSelections} selected
        </p>
      )}
    </div>
  );
}
