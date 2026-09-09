export interface ManagerApprovalResponse {
  id: string;
  idea_id: string;
  submission_number: string;
  category: string;
  idea_title: string | null;
  problem: string;
  idea_description: string;
  benefit: string | null;
  additional_info: string | null;
  annual_estimate: number | null;
  employee_name: string;
  employee_email: string;
  decision: string;
  reviewer_comment: string | null;
  reviewed_by_name: string;
  reviewed_by_email: string;
  created_at: string;
}
