"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, User, Calendar, Tag, AlertCircle } from "lucide-react";
import {
  getDashboardStats,
  getRecentIdeas,
  type DashboardStats,
  type PaginatedIdeas,
} from "@/services/dashboardService";
import { getIdeaById } from "@/services/ideaService";
import { getCategories, type CategoryResponse } from "@/services/categoryService";
import type { IdeaResponse } from "@/types/idea";
import styles from "./dashboard.module.css";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review_l1: "L1 Review",
  approved_l1: "L1 Approved",
  rejected_l1: "L1 Rejected",
  under_review_l2: "L2 Review",
  approved_l2: "L2 Approved",
  rejected_l2: "L2 Declined",
  implemented: "Implemented",
};

const STATUS_CLS: Record<string, string> = {
  submitted: "badgeBlue",
  under_review_l1: "badgeAmber",
  approved_l1: "badgeGreen",
  rejected_l1: "badgeRed",
  under_review_l2: "badgeAmber",
  approved_l2: "badgeGreen",
  rejected_l2: "badgeRed",
  implemented: "badgePurple",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ideas, setIdeas] = useState<PaginatedIdeas | null>(null);
  const [page, setPage] = useState(1);
  const [ideasLoading, setIdeasLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [funnelTip, setFunnelTip] = useState<{ idx: number; x: number; y: number } | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setIdeasLoading(true);
    getRecentIdeas(page)
      .then(setIdeas)
      .catch(() => {})
      .finally(() => setIdeasLoading(false));
  }, [page]);

  const openIdeaModal = useCallback(async (id: string) => {
    setModalOpen(true);
    setSelectedIdea(null);
    setModalLoading(true);
    try {
      const idea = await getIdeaById(id);
      setSelectedIdea(idea);
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedIdea(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  const weightMap = useMemo<Record<string, number>>(() => {
    if (!selectedIdea) return {};
    const matrix = categories.find((c) => c.name === selectedIdea.category)?.matrix ?? [];
    return Object.fromEntries(matrix.map((m) => [m.label, m.weight]));
  }, [selectedIdea, categories]);

  const monthly = stats?.monthly_submissions ?? [];
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const funnel = stats?.by_function_funnel ?? [];
  const maxSubmitted = Math.max(...funnel.map((f) => f.submitted), 1);

  return (
    <>
    <main className={styles.container}>
      <div className={styles.inner}>

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Idea Submission Dashboard</h1>
          <p className={styles.pageSubtitle}>
            YTD performance across all idea categories
          </p>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <p className={styles.statLabel}>TOTAL SUBMITTED</p>
            <p className={`${styles.statValue} ${styles.valPurple}`}>
              {stats?.total_submitted ?? "—"}
            </p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardYellow}`}>
            <p className={styles.statLabel}>MANAGER APPROVED</p>
            <p className={`${styles.statValue} ${styles.valAmber}`}>
              {stats?.manager_approved ?? "—"}
            </p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <p className={styles.statLabel}>GROUP APPROVED</p>
            <p className={`${styles.statValue} ${styles.valGreen}`}>
              {stats?.group_approved ?? "—"}
            </p>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <p className={styles.statLabel}>IMPLEMENTED</p>
            <p className={`${styles.statValue} ${styles.valPurple}`}>
              {stats?.implemented ?? "—"}
            </p>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className={styles.chartsRow}>
          {/* Bar chart */}
          <div className={styles.chartCard}>
            <p className={styles.chartTitle}>MONTHLY SUBMISSIONS</p>
            <div className={styles.barChart}>
              {monthly.length === 0
                ? <p className={styles.chartEmpty}>No data yet</p>
                : monthly.map((m, i) => (
                    <div key={i} className={styles.barCol}>
                      <span className={styles.barCount}>{m.count}</span>
                      <div
                        className={styles.bar}
                        style={{ height: `${Math.max(3, (m.count / maxCount) * 82)}%` }}
                      />
                      <span className={styles.barLabel}>{m.month}</span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Funnel */}
          <div className={styles.chartCard}>
            <p className={styles.chartTitle}>BY FUNCTION — TWO-STAGE FUNNEL</p>
            <div className={styles.funnelList}>
              {funnel.length === 0
                ? <p className={styles.chartEmpty}>No data yet</p>
                : funnel.map((f, i) => (
                    <div
                      key={i}
                      className={styles.funnelRow}
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setFunnelTip({ idx: i, x: r.left, y: r.top - 6 });
                      }}
                      onMouseLeave={() => setFunnelTip(null)}
                    >
                      <span className={styles.funnelCat}>{f.category}</span>
                      <div className={styles.funnelTrack}>
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.submitted / maxSubmitted) * 100}%`,
                            background: "#D9B8C4",
                          }}
                        />
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.l1_approved / maxSubmitted) * 100}%`,
                            background: "#C9A24A",
                          }}
                        />
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.l2_approved / maxSubmitted) * 100}%`,
                            background: "#5F7857",
                          }}
                        />
                      </div>
                      <span className={styles.funnelNums}>
                        {f.l1_approved}/{f.submitted} → {f.l2_approved}
                      </span>
                    </div>
                  ))}
            </div>
            <div className={styles.funnelLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#D9B8C4" }} />
                Submitted
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#C9A24A" }} />
                L1 Approved
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#5F7857" }} />
                L2 Approved
              </span>
            </div>
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <p className={styles.chartTitle}>RECENT ACTIVITY</p>
            <span className={styles.recentMeta}>Latest {ideas?.total ?? 0} ideas</span>
          </div>

          {/* Table header */}
          <div className={styles.tHead}>
            <span>ID</span>
            <span>TITLE</span>
            <span>CATEGORY</span>
            <span>L1 MANAGER</span>
            <span>STATUS</span>
            <span>L2 SCORE</span>
          </div>

          {/* Rows */}
          {ideasLoading ? (
            <div className={styles.tLoading}>Loading…</div>
          ) : (
            ideas?.items.map((idea) => (
              <div
                key={idea.id}
                className={styles.tRow}
                onClick={() => void openIdeaModal(idea.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") void openIdeaModal(idea.id); }}
              >
                {/* Desktop grid cells */}
                <span className={styles.ideaId}>{idea.submission_number}</span>
                <span className={styles.ideaTitle} title={idea.idea_title ?? ""}>
                  {idea.idea_title
                    ? idea.idea_title.length > 40
                      ? idea.idea_title.slice(0, 40) + "…"
                      : idea.idea_title
                    : "—"}
                </span>
                <span className={styles.ideaCat}>{idea.category}</span>
                <span>
                  {idea.l1_decision === "approved" ? (
                    <span className={`${styles.badge} ${styles.badgeGreen}`}>Approved</span>
                  ) : idea.l1_decision === "rejected" ? (
                    <span className={`${styles.badge} ${styles.badgeRed}`}>Rejected</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeAmber}`}>Pending</span>
                  )}
                </span>
                <span>
                  <span className={`${styles.badge} ${styles[STATUS_CLS[idea.status] ?? "badgeBlue"]}`}>
                    {STATUS_LABELS[idea.status] ?? idea.status}
                  </span>
                </span>
                <span className={styles.l2Score}>
                  {idea.l2_score !== null ? (
                    <span className={styles.scoreCircle}>{Math.round(idea.l2_score * 10)}</span>
                  ) : (
                    <span className={styles.scoreDash}>—</span>
                  )}
                </span>

                {/* Mobile card view */}
                <div className={styles.mobileCard}>
                  <div className={styles.mobileCardTop}>
                    <span className={styles.ideaId}>{idea.submission_number}</span>
                    <span className={`${styles.badge} ${styles[STATUS_CLS[idea.status] ?? "badgeBlue"]}`}>
                      {STATUS_LABELS[idea.status] ?? idea.status}
                    </span>
                  </div>
                  <p className={styles.mobileCardTitle}>
                    {idea.idea_title ?? "—"}
                  </p>
                  <div className={styles.mobileCardMeta}>
                    <span className={styles.mobileCardCat}>{idea.category}</span>
                    <span className={styles.mobileCardSep} />
                    {idea.l1_decision === "approved" ? (
                      <span className={`${styles.badge} ${styles.badgeGreen}`}>L1 ✓</span>
                    ) : idea.l1_decision === "rejected" ? (
                      <span className={`${styles.badge} ${styles.badgeRed}`}>L1 ✗</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeAmber}`}>L1 Pending</span>
                    )}
                    {idea.l2_score !== null && (
                      <>
                        <span className={styles.mobileCardSep} />
                        <span className={styles.scoreCircle}>{Math.round(idea.l2_score * 10)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {ideas && ideas.pages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {ideas.pages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(ideas.pages, p + 1))}
                disabled={page >= ideas.pages}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>

    {/* ── Funnel tooltip ── */}
    {funnelTip !== null && (() => {
      const f = funnel[funnelTip.idx];
      if (!f) return null;
      const pct = (n: number) => f.submitted > 0 ? ` (${Math.round((n / f.submitted) * 100)}%)` : "";
      return (
        <div className={styles.funnelTooltip} style={{ left: funnelTip.x, top: funnelTip.y }}>
          <p className={styles.tooltipTitle}>{f.category}</p>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: "#D9B8C4" }} />
            <span className={styles.tooltipLabel}>Submitted</span>
            <span className={styles.tooltipValue}>{f.submitted}</span>
            <span className={styles.tooltipPct}>100%</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: "#C9A24A" }} />
            <span className={styles.tooltipLabel}>L1 Approved</span>
            <span className={styles.tooltipValue}>{f.l1_approved}</span>
            <span className={styles.tooltipPct}>{pct(f.l1_approved)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: "#5F7857" }} />
            <span className={styles.tooltipLabel}>L2 Approved</span>
            <span className={styles.tooltipValue}>{f.l2_approved}</span>
            <span className={styles.tooltipPct}>{pct(f.l2_approved)}</span>
          </div>
        </div>
      );
    })()}

    {/* ── Idea Detail Modal ── */}
    {modalOpen && (
      <div className={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true">
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

          {modalLoading && (
            <div className={styles.modalLoadingState}>
              <div className={styles.spinner} />
              <p>Loading idea details…</p>
            </div>
          )}

          {!modalLoading && selectedIdea && (
            <>
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderLeft}>
                  <span className={styles.modalSubmissionNo}>{selectedIdea.submission_number}</span>
                  <h2 className={styles.modalTitle}>
                    {selectedIdea.idea_title ?? "Untitled Idea"}
                  </h2>
                  <span
                    className={`${styles.badge} ${
                      styles[STATUS_CLS[selectedIdea.status] ?? "badgeBlue"]
                    }`}
                  >
                    {STATUS_LABELS[selectedIdea.status] ?? selectedIdea.status}
                  </span>
                </div>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              {/* Meta row */}
              <div className={styles.modalMeta}>
                <span className={styles.modalMetaItem}>
                  <User size={12} />
                  {selectedIdea.submitter_name}
                </span>
                <span className={styles.modalMetaDot} />
                <span className={styles.modalMetaItem}>
                  <Tag size={12} />
                  {selectedIdea.category}
                </span>
                <span className={styles.modalMetaDot} />
                <span className={styles.modalMetaItem}>
                  <Calendar size={12} />
                  {formatDate(selectedIdea.created_at)}
                </span>
              </div>

              <div className={styles.modalBody}>

                {/* Idea details */}
                <div className={styles.modalSection}>
                  <p className={styles.modalSectionTitle}>PROBLEM STATEMENT</p>
                  <p className={styles.modalText}>{selectedIdea.problem}</p>
                </div>

                <div className={styles.modalSection}>
                  <p className={styles.modalSectionTitle}>PROPOSED SOLUTION</p>
                  <p className={styles.modalText}>{selectedIdea.idea_description}</p>
                </div>

                {selectedIdea.benefit && (
                  <div className={styles.modalSection}>
                    <p className={styles.modalSectionTitle}>EXPECTED BENEFIT</p>
                    <p className={styles.modalText}>{selectedIdea.benefit}</p>
                  </div>
                )}

                {/* Manager comment */}
                {selectedIdea.reviewer_comment && (
                  <div className={styles.modalSection}>
                    <p className={styles.modalSectionTitle}>MANAGER&apos;S COMMENT (L1)</p>
                    <div className={styles.commentBox}>
                      <AlertCircle size={14} className={styles.commentIcon} />
                      <p className={styles.commentText}>{selectedIdea.reviewer_comment}</p>
                    </div>
                  </div>
                )}

                {/* L2 Scoring */}
                {selectedIdea.l2_scores && Object.keys(selectedIdea.l2_scores).length > 0 && (
                  <div className={styles.modalSection}>
                    <p className={styles.modalSectionTitle}>MANAGEMENT SCORING MATRIX (L2)</p>
                    <div className={styles.scoreMatrix}>
                      {Object.entries(selectedIdea.l2_scores).map(([criterion, score]) => (
                        <div key={criterion} className={styles.scoreRow}>
                          <div className={styles.scoreCriterionWrap}>
                            <span className={styles.scoreCriterion}>{criterion}</span>
                            {weightMap[criterion] !== null && (
                              <span className={styles.scoreWeight}>weight {weightMap[criterion]}%</span>
                            )}
                          </div>
                          <div className={styles.scoreBarWrap}>
                            <div
                              className={styles.scoreBarFill}
                              style={{ width: `${Math.min(100, score * 10)}%` }}
                            />
                          </div>
                          <span className={styles.scoreVal}>{score * 10}<span className={styles.scoreOutOf}>/100</span></span>
                        </div>
                      ))}
                    </div>

                    {selectedIdea.l2_weighted_score !== null && (
                      <div className={styles.totalScoreRow}>
                        <span className={styles.totalScoreLabel}>Total Score</span>
                        <div className={styles.totalScoreBadge}>
                          <span className={styles.totalScoreNum}>
                            {Math.round(selectedIdea.l2_weighted_score * 10)}
                          </span>
                          <span className={styles.totalScoreOf}>/100</span>
                        </div>
                        <div className={styles.totalScoreBar}>
                          <div
                            className={styles.totalScoreBarFill}
                            style={{ width: `${Math.min(100, selectedIdea.l2_weighted_score * 10)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {selectedIdea.l2_comment && (
                  <div className={styles.modalSection}>
                    <p className={styles.modalSectionTitle}>RECOMMENDATIONS</p>
                    <p className={styles.modalText}>{selectedIdea.l2_comment}</p>
                  </div>
                )}

                {/* Next step */}
                {selectedIdea.l2_next_step && (
                  <div className={styles.modalSection}>
                    <p className={styles.modalSectionTitle}>NEXT STEPS</p>
                    <div className={styles.nextStepBox}>
                      <p className={styles.modalText}>{selectedIdea.l2_next_step}</p>
                    </div>
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    )}
  </>
  );
}
