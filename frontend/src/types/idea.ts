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
  l2_scores: Record<string, number> | null;
  l2_comment: string | null;
  l2_next_step: string | null;
  l2_weighted_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaReviewUpdate {
  status: IdeaStatus;
  reviewer_comment?: string;
}

export interface IdeaL2ReviewUpdate {
  status: IdeaStatus;
  l2_scores: Record<string, number>;
  l2_weighted_score: number;
  l2_comment?: string;
  l2_next_step?: string;
  l2_expected_timeline?: string;
  manager_approval_id: string;
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
