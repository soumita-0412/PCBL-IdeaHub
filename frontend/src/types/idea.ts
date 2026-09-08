export type IdeaStatus =
  | "submitted"
  | "under_review_l1"
  | "approved_l1"
  | "rejected_l1"
  | "under_review_l2"
  | "approved_l2"
  | "rejected_l2"
  | "implemented";

export interface IdeaCreate {
  category: string;
  problem: string;
  idea_description: string;
  patent_search_done: boolean;
  patent_link?: string;
  pcbl_function: string;
  pcbl_function_other?: string;
  annual_estimate?: number;
  additional_info?: string;
}

export interface IdeaResponse {
  id: string;
  submission_number: string;
  status: IdeaStatus;
  category: string;
  problem: string;
  idea_description: string;
  patent_search_done: boolean;
  patent_link: string | null;
  pcbl_function: string;
  pcbl_function_other: string | null;
  annual_estimate: number | null;
  additional_info: string | null;
  submitter_id: string;
  submitter_name: string;
  submitter_email: string;
  reviewer_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaReviewUpdate {
  status: IdeaStatus;
  reviewer_comment?: string;
}

export interface IdeaListItem {
  id: string;
  submission_number: string;
  status: IdeaStatus;
  category: string;
  pcbl_function: string;
  submitter_name: string;
  submitter_email: string;
  created_at: string;
}
