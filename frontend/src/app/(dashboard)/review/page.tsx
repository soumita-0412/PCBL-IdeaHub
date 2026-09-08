"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { getAllIdeas, reviewIdea } from "@/services/ideaService";
import type { IdeaResponse, IdeaStatus } from "@/types/idea";
import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, Roles } from "@/constants/roles";
import styles from "./review.module.css";

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
  idea: IdeaResponse;
  selected: boolean;
  onClick: () => void;
}

function IdeaRow({ idea, selected, onClick }: IdeaRowProps) {
  return (
    <div
      className={`${styles.ideaRow} ${selected ? styles.ideaRowSelected : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <span className={styles.ideaRowNumber}>{idea.submission_number}</span>
      <p className={styles.ideaRowTitle}>{idea.category}</p>
      <p className={styles.ideaRowSub}>{idea.pcbl_function}</p>
    </div>
  );
}

// ── Right panel: detail + review form ─────────────────────────────────────────

interface DetailPanelProps {
  idea: IdeaResponse;
  onReviewed: (updated: IdeaResponse) => void;
}

function DetailPanel({ idea, onReviewed }: DetailPanelProps) {
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

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailScroll}>

        {/* ── Meta row ──────────────────────────────────────── */}
        <div className={styles.detailMeta}>
          <span className={styles.detailNumber}>{idea.submission_number}</span>
          <span className={`${styles.dotIndicator} ${statusDotClass(idea.status)}`} />
          <span className={styles.detailStatusText}>
            {idea.status.replace(/_/g, " ")}
          </span>
          <span className={styles.detailMetaSep}>·</span>
          <span className={styles.detailSubmitter}>{idea.submitter_name}</span>
        </div>

        <h2 className={styles.detailTitle}>{idea.category}</h2>

        {/* ── Section cards ─────────────────────────────────── */}
        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Problem Statement</p>
          <p className={styles.sectionText}>{idea.problem}</p>
        </div>

        <div className={styles.sectionCard}>
          <p className={styles.sectionLabel}>Proposed Solution</p>
          <p className={styles.sectionText}>{idea.idea_description}</p>
        </div>

        {idea.patent_search_done && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Patent Search</p>
            <p className={styles.sectionText}>
              Done
              {idea.patent_link && (
                <> — <a href={idea.patent_link} target="_blank" rel="noopener noreferrer" className={styles.link}>{idea.patent_link}</a></>
              )}
            </p>
          </div>
        )}

        {idea.annual_estimate != null && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Estimated Savings</p>
            <p className={styles.sectionText}>
              ₹&nbsp;{idea.annual_estimate.toLocaleString("en-IN")} annual
            </p>
          </div>
        )}

        {idea.additional_info && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Additional Info</p>
            <p className={styles.sectionText}>{idea.additional_info}</p>
          </div>
        )}

        {/* ── Comments ──────────────────────────────────────── */}
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

        {/* ── Decision toggle ───────────────────────────────── */}
        <div className={styles.reviewBlock}>
          <p className={styles.reviewBlockLabel}>Decision</p>
          <div className={styles.decisionRow}>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "approve" ? styles.decisionBtnApprove : ""}`}
              onClick={() => setDecision(decision === "approve" ? null : "approve")}
              disabled={submitting}
            >
              <Check size={15} />
              Approve
            </button>
            <button
              type="button"
              className={`${styles.decisionBtn} ${decision === "reject" ? styles.decisionBtnReject : ""}`}
              onClick={() => setDecision(decision === "reject" ? null : "reject")}
              disabled={submitting}
            >
              <X size={15} />
              Reject
            </button>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>Decision submitted successfully.</p>}

        {/* ── Submit ────────────────────────────────────────── */}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewDashboardPage() {
  const { userProfile } = useAuthStore();
  const [ideas, setIdeas] = useState<IdeaResponse[] | null>(null);
  const [selected, setSelected] = useState<IdeaResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const canReview = hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER);

  useEffect(() => {
    getAllIdeas()
      .then((data) => {
        setIdeas(data);
        if (data.length > 0) setSelected(data[0]!);
      })
      .catch(() => setFetchError("Failed to load ideas. Please try again."));
  }, []);

  const handleReviewed = useCallback((updated: IdeaResponse) => {
    setIdeas((prev) => prev?.map((i) => (i.id === updated.id ? updated : i)) ?? prev);
    setSelected(updated);
  }, []);

  if (!canReview) {
    return (
      <main className={styles.container}>
        <p className={styles.accessDenied}>You do not have permission to access the Review Dashboard.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.layout}>

        {/* ── Left sidebar ──────────────────────────────────── */}
        <aside className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <p className={styles.leftHeaderLabel}>Pending Approval</p>
            <p className={styles.leftHeaderSub}>L1 Manager Review</p>
          </div>

          <div className={styles.leftList}>
            {fetchError && <p className={styles.errorMsg}>{fetchError}</p>}

            {!fetchError && ideas === null && (
              <>
                {[1, 2, 3].map((n) => <div key={n} className={styles.skeletonRow} />)}
              </>
            )}

            {ideas !== null && ideas.length === 0 && (
              <p className={styles.emptyMsg}>No ideas to review.</p>
            )}

            {ideas !== null && ideas.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                selected={selected?.id === idea.id}
                onClick={() => setSelected(idea)}
              />
            ))}
          </div>
        </aside>

        {/* ── Right content ─────────────────────────────────── */}
        <div className={styles.rightPanel}>
          {selected ? (
            <DetailPanel
              key={selected.id}
              idea={selected}
              onReviewed={handleReviewed}
            />
          ) : (
            <div className={styles.emptyDetail}>
              <p className={styles.emptyDetailText}>Select an idea from the list to begin review.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
