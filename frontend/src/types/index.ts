/** Generic paginated API response envelope. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Standard API error shape returned by the backend. */
export interface ApiError {
  detail: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

/** Authenticated user profile (from MSAL + Graph API). */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  job_title?: string;
  department?: string;
  avatar_url?: string;
}

/** Common select option used in dropdowns / comboboxes. */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
