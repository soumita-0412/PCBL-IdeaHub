"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Check, X, Minus } from "lucide-react";
import { getAllIdeas, reviewIdea, l2ReviewIdea } from "@/services/ideaService";
import { getApprovedManagerApprovals } from "@/services/managerApprovalService";
import { getCategories, type CategoryResponse } from "@/services/categoryService";
import type { IdeaResponse, IdeaStatus } from "@/types/idea";
import type { ManagerApprovalResponse } from "@/types/managerApproval";
import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, Roles } from "@/constants/roles";
import styles from "./review.module.css";

type ReviewMode = "manager" | "management";
type L2Decision = "approve" | "hold" | "decline" | null;

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error?.message as string | undefined;
    if (msg) return msg;
  }
  return fallback;
}

function statusDotClass(s: IdeaStatus): string {
  switch (s) {
    case "approved_l1":
    case "approved_l2":
    case "implemented":  return styles.dotGreen!;
    case "rejected_l1":
    case "rejected_l2":  return styles.dotRed!;
    default:             return styles.dotAmber!;
  }
}

// ── Left panel: compact idea row ──────────────────────────────────────────────

interface IdeaRowProps {
  submissionNumber: string;
  title: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}

function IdeaRow({ submissionNumber, title, sub, selected, onClick }: IdeaRowProps) {
  return (
    <div
      className={`${styles.ideaRow} ${selected ? styles.ideaRowSelected : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <span className={styles.ideaRowNumber}>{submissionNumber}</span>
      <p className={styles.ideaRowTitle}>{title}</p>
      <p className={styles.ideaRowSub}>{sub}</p>
    </div>
  );
}

// ── Scoring matrix row ────────────────────────────────────────────────────────

interface ScoreRowProps {
  label: string;
  weight: number;
  value: number;
  onChange: (val: number) => void;
}

function ScoreRow({ label, weight, value, onChange }: ScoreRowProps) {
  return (
    <div className={styles.scoreRow}>
      <div className={styles.scoreRowTop}>
        <span className={styles.scoreLabel}>{label}</span>
        <span className={styles.scoreMeta}>
          weight {weight}%&ensp;
          <span className={styles.scoreValue}>{value}/10</span>
        </span>
      </div>
      <div className={styles.scoreRowControls}>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.dots}>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`${styles.scoreDot} ${i < value ? styles.scoreDotFilled : styles.scoreDotEmpty}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── L1 Manager detail panel ───────────────────────────────────────────────────

interface L1DetailPanelProps {
  idea: IdeaResponse;
  onReviewed: (updated: IdeaResponse) => void;
}

function L1DetailPanel({ idea, onReviewed }: L1DetailPanelProps) {
  const [comment, setComment] = useState(idea.reviewer_comment ?? "");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setComment(idea.reviewer_comment ?? "");
    setDecision(null);
    setError(null);
    setSuccess(false);
  }, [idea.id]);

  const handleSubmit = useCallback(async () => {
    if (!decision) return;
    const newStatus: IdeaStatus = decision === "approve" ? "approved_l1" : "rejected_l1";
    setSubmitting(true);
    setError(null);
    try {
      const updated = await reviewIdea(idea.id, {
        status: newStatus,
        ...(comment ? { reviewer_comment: comment } : {}),
      });
      onReviewed(updated);
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }, [idea.id, comment, decision, onReviewed]);

  const date = new Date(idea.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailScroll}>
        <div className={styles.detailMeta}>
          <span className={styles.detailNumber}>{idea.submission_number}</span>
          <span className={`${styles.dotIndicator} ${statusDotClass(idea.status)}`} />
          <span className={styles.detailStatusText}>{idea.status.replace(/_/g, " ")}</span>
          <span className={styles.detailMetaSep}>·</span>
          <span className={styles.detailSubmitter}>{idea.submitter_name}</span>
        </div>
        <h2 className={styles.detailTitle}>{idea.category}</h2>
        <p className={styles.detailSubtitle}>Submitted by {idea.submitter_name} on {date}</p>

        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Problem Statement</p>
          <p className={styles.sectionText}>{idea.problem}</p>
        </div>
        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Proposed Solution</p>
          <p className={styles.sectionText}>{idea.idea_description}</p>
        </div>
        {idea.additional_info && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Expected Benefits</p>
            <p className={styles.sectionText}>{idea.additional_info}</p>
          </div>
        )}
        {idea.annual_estimate != null && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Estimated Savings</p>
            <p className={styles.sectionText}>₹ {idea.annual_estimate.toLocaleString("en-IN")} annual</p>
          </div>
        )}

        <div className={styles.reviewBlock}>
          <p className={styles.reviewBlockLabel}>Comments (Optional)</p>
          <textarea
            className={styles.commentBox}
            placeholder="Add comments for the submitter or group panel…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            disabled={submitting}
          />
        </div>

        <div className={styles.reviewBlock}>
          <p className={styles.reviewBlockLabel}>Decision</p>
          <div className={styles.decisionRow}>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "approve" ? styles.decisionBtnApprove : ""}`}
              onClick={() => setDecision(decision === "approve" ? null : "approve")}
              disabled={submitting}
            >
              <Check size={15} /> Approve
            </button>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "reject" ? styles.decisionBtnReject : ""}`}
              onClick={() => setDecision(decision === "reject" ? null : "reject")}
              disabled={submitting}
            >
              <X size={15} /> Reject
            </button>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>Decision submitted successfully.</p>}

        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!decision || submitting}
        >
          {submitting ? "Submitting…" : "Submit Manager Decision"}
        </button>
      </div>
    </div>
  );
}

// ── L2 Management detail panel ────────────────────────────────────────────────

interface L2DetailPanelProps {
  approval: ManagerApprovalResponse;
  category: CategoryResponse | undefined;
  onSubmitted: (id: string) => void;
}

function L2DetailPanel({ approval, category, onSubmitted }: L2DetailPanelProps) {
  const initialScores = useMemo(() => {
    const map: Record<string, number> = {};
    category?.matrix.forEach((c) => { map[c.label] = 0; });
    return map;
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<L2Decision>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setScores(initialScores);
    setComment("");
    setDecision(null);
    setError(null);
    setSuccess(false);
  }, [approval.id, initialScores]);

  const weightedScore = useMemo(() => {
    if (!category?.matrix.length) return 0;
    return category.matrix.reduce((acc, c) => acc + ((scores[c.label] ?? 0) * c.weight) / 100, 0);
  }, [scores, category]);

  const handleSubmit = useCallback(async () => {
    if (!decision) return;
    const statusMap: Record<NonNullable<L2Decision>, IdeaStatus> = {
      approve: "approved_l2",
      hold: "under_review_l2",
      decline: "rejected_l2",
    };
    setSubmitting(true);
    setError(null);
    try {
      await l2ReviewIdea(approval.idea_id, {
        status: statusMap[decision],
        l2_scores: scores,
        l2_weighted_score: weightedScore,
        manager_approval_id: approval.id,
        ...(comment ? { l2_comment: comment } : {}),
      });
      setSuccess(true);
      onSubmitted(approval.id);
    } catch (err) {
      setError(apiErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }, [approval.id, approval.idea_id, decision, scores, weightedScore, comment, onSubmitted]);

  const date = new Date(approval.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailScroll}>

        <div className={styles.l2Badge}>Level 2 — Group Scoring</div>
        <p className={styles.l2IdeaMeta}>{approval.submission_number} · {approval.category}</p>
        <h2 className={styles.detailTitle}>{approval.category}</h2>
        <p className={styles.detailSubtitle}>
          Submitted by {approval.employee_name} on {date}
          &ensp;·&ensp;
          <span className={styles.managerApprovedBy}>
            Approved by manager: {approval.reviewed_by_name}
          </span>
        </p>

        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Problem Statement</p>
          <p className={styles.sectionText}>{approval.problem}</p>
        </div>
        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Proposed Solution</p>
          <p className={styles.sectionText}>{approval.idea_description}</p>
        </div>
        {approval.additional_info && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Expected Benefits</p>
            <p className={styles.sectionText}>{approval.additional_info}</p>
          </div>
        )}
        {approval.annual_estimate != null && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Estimated Savings</p>
            <p className={styles.sectionText}>₹ {approval.annual_estimate.toLocaleString("en-IN")} annual</p>
          </div>
        )}

        {/* Scoring matrix — always shown */}
        <div className={styles.matrixCard}>
          <div className={styles.matrixCardHeader}>
            <p className={styles.matrixCardTitle}>
              Scoring Matrix{category ? ` — ${category.name}` : ""}
            </p>
            {category && category.matrix.length > 0 && (
              <span className={styles.weightedScoreLabel}>
                Weighted Score&ensp;
                <span className={styles.weightedScoreValue}>
                  {(weightedScore * 10).toFixed(1)}%
                </span>
              </span>
            )}
          </div>

          {!category && (
            <p className={styles.matrixEmpty}>
              Could not load scoring criteria for &ldquo;{approval.category}&rdquo;.
              Ensure this category exists in the Admin Dashboard.
            </p>
          )}
          {category && category.matrix.length === 0 && (
            <p className={styles.matrixEmpty}>
              No scoring criteria defined for &ldquo;{category.name}&rdquo; yet.
              Add criteria in the Admin Dashboard.
            </p>
          )}
          {category && category.matrix.length > 0 && (
            <div className={styles.matrixRows}>
              {category.matrix.map((c) => (
                <ScoreRow
                  key={c.label}
                  label={c.label}
                  weight={c.weight}
                  value={scores[c.label] ?? 0}
                  onChange={(val) => setScores((prev) => ({ ...prev, [c.label]: val }))}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.reviewBlock}>
          <p className={styles.reviewBlockLabel}>Qualitative Feedback</p>
          <textarea
            className={styles.commentBox}
            placeholder="Observations, recommendations…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            disabled={submitting}
          />
        </div>

        <div className={styles.reviewBlock}>
          <p className={styles.reviewBlockLabel}>Decision</p>
          <div className={styles.decisionRow3}>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "approve" ? styles.decisionBtnApprove : ""}`}
              onClick={() => setDecision(decision === "approve" ? null : "approve")}
              disabled={submitting}
            >
              <Check size={15} /> Approve
            </button>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "hold" ? styles.decisionBtnHold : ""}`}
              onClick={() => setDecision(decision === "hold" ? null : "hold")}
              disabled={submitting}
            >
              <Minus size={15} /> Hold
            </button>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "decline" ? styles.decisionBtnReject : ""}`}
              onClick={() => setDecision(decision === "decline" ? null : "decline")}
              disabled={submitting}
            >
              <X size={15} /> Decline
            </button>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>Group review submitted and saved successfully.</p>}

        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!decision || submitting || success}
        >
          {submitting ? "Submitting…" : "Submit Group Review"}
        </button>

      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewDashboardPage() {
  const { userProfile } = useAuthStore();
  const [mode, setMode] = useState<ReviewMode>("manager");

  // Manager mode state
  const [ideas, setIdeas] = useState<IdeaResponse[] | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<IdeaResponse | null>(null);

  // Management mode state
  const [approvals, setApprovals] = useState<ManagerApprovalResponse[] | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ManagerApprovalResponse | null>(null);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const canReview = hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER);

  useEffect(() => {
    Promise.all([getAllIdeas(), getCategories(), getApprovedManagerApprovals()])
      .then(([ideasData, catsData, approvalsData]) => {
        setIdeas(ideasData);
        setCategories(catsData);
        setApprovals(approvalsData);
        if (ideasData.length > 0) setSelectedIdea(ideasData[0]!);
        if (approvalsData.length > 0) setSelectedApproval(approvalsData[0]!);
      })
      .catch(() => setFetchError("Failed to load data. Please try again."));
  }, []);

  const handleIdeaReviewed = useCallback((updated: IdeaResponse) => {
    setIdeas((prev) => prev?.map((i) => (i.id === updated.id ? updated : i)) ?? prev);
    setSelectedIdea(updated);
    // If approved, refresh the L2 approvals list so it appears in Management mode immediately
    if (updated.status === "approved_l1") {
      getApprovedManagerApprovals()
        .then((data) => {
          setApprovals(data);
          if (data.length > 0 && !selectedApproval) setSelectedApproval(data[0]!);
        })
        .catch(() => {/* silent — main data already loaded */});
    }
  }, [selectedApproval]);

  // Remove the approval from the list after L2 review is submitted
  const handleApprovalSubmitted = useCallback((approvalId: string) => {
    setApprovals((prev) => {
      const next = prev?.filter((a) => a.id !== approvalId) ?? prev;
      setSelectedApproval(next && next.length > 0 ? next[0]! : null);
      return next;
    });
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === (mode === "manager" ? selectedIdea?.category : selectedApproval?.category)),
    [categories, mode, selectedIdea?.category, selectedApproval?.category]
  );

  // Auto-select first when switching modes
  useEffect(() => {
    if (mode === "manager" && ideas && ideas.length > 0) setSelectedIdea(ideas[0]!);
    if (mode === "management" && approvals && approvals.length > 0) setSelectedApproval(approvals[0]!);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!canReview) {
    return (
      <main className={styles.container}>
        <p className={styles.accessDenied}>You do not have permission to access the Review Dashboard.</p>
      </main>
    );
  }

  const listData = mode === "manager" ? ideas : approvals;

  return (
    <main className={styles.container}>
      <div className={styles.layout}>

        {/* ── Left sidebar ──────────────────────────────────── */}
        <aside className={styles.leftPanel}>
          <div className={styles.modeSwitcher}>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === "manager" ? styles.modeBtnActive : ""}`}
              onClick={() => setMode("manager")}
            >
              Review as Manager
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${mode === "management" ? styles.modeBtnActive : ""}`}
              onClick={() => setMode("management")}
            >
              Review as Management
            </button>
          </div>

          <div className={styles.leftHeader}>
            <p className={styles.leftHeaderLabel}>
              {mode === "manager" ? "Pending Approval" : "Manager Approved"}
            </p>
            <p className={styles.leftHeaderSub}>
              {mode === "manager" ? "L1 Manager Review" : "L2 Group Scoring"}
            </p>
          </div>

          <div className={styles.leftList}>
            {fetchError && <p className={styles.errorMsg}>{fetchError}</p>}

            {!fetchError && listData === null && (
              <>{[1, 2, 3].map((n) => <div key={n} className={styles.skeletonRow} />)}</>
            )}

            {listData !== null && listData.length === 0 && (
              <p className={styles.emptyMsg}>
                {mode === "management" ? "No manager-approved ideas yet." : "No ideas to review."}
              </p>
            )}

            {mode === "manager" && ideas !== null && ideas.map((idea) => (
              <IdeaRow
                key={idea.id}
                submissionNumber={idea.submission_number}
                title={idea.category}
                sub={idea.pcbl_function}
                selected={selectedIdea?.id === idea.id}
                onClick={() => setSelectedIdea(idea)}
              />
            ))}

            {mode === "management" && approvals !== null && approvals.map((approval) => (
              <IdeaRow
                key={approval.id}
                submissionNumber={approval.submission_number}
                title={approval.category}
                sub={approval.employee_name}
                selected={selectedApproval?.id === approval.id}
                onClick={() => setSelectedApproval(approval)}
              />
            ))}
          </div>
        </aside>

        {/* ── Right content ─────────────────────────────────── */}
        <div className={styles.rightPanel}>
          {mode === "manager" ? (
            selectedIdea ? (
              <L1DetailPanel
                key={`l1-${selectedIdea.id}`}
                idea={selectedIdea}
                onReviewed={handleIdeaReviewed}
              />
            ) : (
              <div className={styles.emptyDetail}>
                <p className={styles.emptyDetailText}>Select an idea from the list to begin review.</p>
              </div>
            )
          ) : (
            selectedApproval ? (
              <L2DetailPanel
                key={`l2-${selectedApproval.id}`}
                approval={selectedApproval}
                category={selectedCategory}
                onSubmitted={handleApprovalSubmitted}
              />
            ) : (
              <div className={styles.emptyDetail}>
                <p className={styles.emptyDetailText}>No manager-approved ideas available for group scoring.</p>
              </div>
            )
          )}
        </div>

      </div>
    </main>
  );
}
