export interface GroupReviewResponse {
  id: string;
  idea_id: string;
  submission_number: string;
  manager_approval_id: string;
  category: string;
  problem: string;
  idea_description: string;
  additional_info: string | null;
  annual_estimate: number | null;
  employee_name: string;
  employee_email: string;
  manager_who_approved_name: string;
  manager_who_approved_email: string;
  criteria_scores: Record<string, number>;
  weighted_score: number;
  decision: string;
  qualitative_feedback: string | null;
  reviewed_by: string;
  reviewed_by_name: string;
  reviewed_by_email: string;
  created_at: string;
}
