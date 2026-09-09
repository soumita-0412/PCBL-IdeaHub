"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, IndianRupee, Star, User, Search, X } from "lucide-react";
import { getAllIdeas } from "@/services/ideaService";
import { getAllManagerApprovals } from "@/services/managerApprovalService";
import type { IdeaResponse, IdeaStatus } from "@/types/idea";
import type { ManagerApprovalResponse } from "@/types/managerApproval";
import { hasMinRole, Roles } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth.store";
import styles from "./repository.module.css";

function statusMeta(s: IdeaStatus): { label: string; cls: string } {
  switch (s) {
    case "submitted":       return { label: "Submitted",   cls: styles.badgeBlue! };
    case "under_review_l1": return { label: "L1 Review",   cls: styles.badgeAmber! };
    case "under_review_l2": return { label: "L2 Review",   cls: styles.badgeAmber! };
    case "approved_l1":     return { label: "L1 Approved", cls: styles.badgeGreen! };
    case "approved_l2":     return { label: "L2 Approved", cls: styles.badgeGreen! };
    case "implemented":     return { label: "Implemented", cls: styles.badgeGreen! };
    case "rejected_l1":     return { label: "L1 Declined", cls: styles.badgeRed! };
    case "rejected_l2":     return { label: "L2 Declined", cls: styles.badgeRed! };
  }
}

const STATUS_FILTERS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
] as const;
type FilterValue = (typeof STATUS_FILTERS)[number]["value"];

function matchesFilter(status: IdeaStatus, f: FilterValue): boolean {
  if (f === "all") return true;
  if (f === "pending")  return ["submitted", "under_review_l1", "under_review_l2", "approved_l1"].includes(status);
  if (f === "approved") return ["approved_l1", "approved_l2", "implemented"].includes(status);
  if (f === "declined") return ["rejected_l1", "rejected_l2"].includes(status);
  return true;
}

// ── Left panel: compact idea row ──────────────────────────────────────────────

function IdeaRow({ idea, selected, onClick }: { idea: IdeaResponse; selected: boolean; onClick: () => void }) {
  const { label, cls } = statusMeta(idea.status);
  return (
    <div
      className={`${styles.ideaRow} ${selected ? styles.ideaRowSelected : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className={styles.ideaRowTop}>
        <span className={styles.ideaRowNumber}>{idea.submission_number}</span>
        <span className={`${styles.badge} ${cls}`}>{label}</span>
      </div>
      <p className={styles.ideaRowTitle}>{idea.idea_title ?? idea.category}</p>
      <div className={styles.ideaRowBottom}>
        <span className={styles.ideaRowSub}>{idea.submitter_name}</span>
        {idea.annual_estimate != null && (
          <span className={styles.ideaRowValue}>
            ₹{idea.annual_estimate >= 100000
              ? `${(idea.annual_estimate / 100000).toFixed(1)}L`
              : idea.annual_estimate.toLocaleString("en-IN")}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 10));
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
  return (
    <div className={styles.scoreBarWrap}>
      <div className={styles.scoreBarTrack}>
        <div className={styles.scoreBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.scoreBarLabel} style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Right panel: detail view ──────────────────────────────────────────────────

function DetailPanel({ idea, reviewer }: { idea: IdeaResponse; reviewer: ManagerApprovalResponse | undefined }) {
  const { label, cls } = statusMeta(idea.status);
  const date = new Date(idea.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const hasL2      = idea.l2_weighted_score != null;
  const hasScores  = idea.l2_scores && Object.keys(idea.l2_scores).length > 0;
  const hasReviewer = !!reviewer;

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailScroll}>

        {/* Header */}
        <div className={styles.detailHeader}>
          <div className={styles.detailHeaderLeft}>
            <span className={styles.detailNumber}>{idea.submission_number}</span>
            <span className={`${styles.badge} ${cls}`}>{label}</span>
          </div>
          <span className={styles.detailDate}>{date}</span>
        </div>

        <h2 className={styles.detailTitle}>{idea.idea_title ?? idea.category}</h2>
        <p className={styles.detailSubtitle}>
          {idea.category}&ensp;·&ensp;Submitted by <strong>{idea.submitter_name}</strong>&ensp;·&ensp;{idea.pcbl_function}
        </p>

        {/* ── Hero: Benefits + Annual Value ── */}
        <div className={styles.heroGrid}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardIconWrap} data-color="green">
              <TrendingUp size={17} />
            </div>
            <div className={styles.heroCardBody}>
              <p className={styles.heroCardLabel}>Benefits</p>
              <p className={styles.heroCardText}>{idea.benefit || "Not specified"}</p>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardIconWrap} data-color="orange">
              <IndianRupee size={17} />
            </div>
            <div className={styles.heroCardBody}>
              <p className={styles.heroCardLabel}>Annual Value Estimate</p>
              {idea.annual_estimate != null ? (
                <p className={styles.heroCardValue}>
                  ₹ {idea.annual_estimate.toLocaleString("en-IN")}
                  <span className={styles.heroCardValueSub}> / year</span>
                </p>
              ) : (
                <p className={styles.heroCardText}>Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviewer + Score block ── */}
        {(hasReviewer || hasL2) && (
          <div className={styles.reviewerRow}>
            {hasReviewer && (
              <div className={styles.reviewerCard}>
                <User size={14} className={styles.reviewerIconUser} />
                <div className={styles.reviewerCardBody}>
                  <p className={styles.reviewerCardLabel}>L1 Reviewer</p>
                  <p className={styles.reviewerCardName}>{reviewer!.reviewed_by_name}</p>
                  {reviewer!.reviewer_comment && (
                    <p className={styles.reviewerCardComment}>&ldquo;{reviewer!.reviewer_comment}&rdquo;</p>
                  )}
                </div>
              </div>
            )}
            {hasL2 && (
              <div className={styles.reviewerCard}>
                <Star size={14} className={styles.reviewerIconStar} />
                <div className={styles.reviewerCardBody}>
                  <p className={styles.reviewerCardLabel}>L2 Score</p>
                  <ScoreBar score={idea.l2_weighted_score!} />
                  {idea.l2_comment && (
                    <p className={styles.reviewerCardComment}>&ldquo;{idea.l2_comment}&rdquo;</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── L2 score breakdown ── */}
        {hasScores && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Score Breakdown</p>
            <div className={styles.scoreBreakdown}>
              {Object.entries(idea.l2_scores!).map(([criterion, score]) => (
                <div key={criterion} className={styles.scoreBreakdownRow}>
                  <span className={styles.scoreBreakdownCriterion}>{criterion}</span>
                  <div className={styles.scoreBreakdownDots}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <span
                        key={i}
                        className={`${styles.dot} ${i < score ? styles.dotFilled : styles.dotEmpty}`}
                      />
                    ))}
                  </div>
                  <span className={styles.scoreBreakdownValue}>{score}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Idea content ── */}
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
            <p className={styles.sectionLabel}>Additional Information</p>
            <p className={styles.sectionText}>{idea.additional_info}</p>
          </div>
        )}
        {idea.l2_next_step && (
          <div className={styles.sectionCard}>
            <p className={styles.sectionLabel}>Next Steps</p>
            <p className={styles.sectionText}>{idea.l2_next_step}</p>
          </div>
        )}

        {/* ── Meta tags ── */}
        <div className={styles.metaTags}>
          <span className={styles.metaTag}>{idea.pcbl_function}</span>
          {idea.patent_search_done && <span className={styles.metaTag}>Patent Searched</span>}
          {idea.patent_link && (
            <a href={idea.patent_link} target="_blank" rel="noreferrer" className={styles.metaTagLink}>
              Patent Link ↗
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RepositoryPage() {
  const { userProfile } = useAuthStore();
  const [ideas, setIdeas]       = useState<IdeaResponse[] | null>(null);
  const [approvals, setApprovals] = useState<ManagerApprovalResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterValue>("all");
  const [search, setSearch]     = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const canAccess = hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER);

  useEffect(() => {
    if (!canAccess) return;
    Promise.all([
      getAllIdeas(),
      getAllManagerApprovals().catch(() => [] as ManagerApprovalResponse[]),
    ]).then(([ideasData, approvalsData]) => {
      setIdeas(ideasData);
      setApprovals(approvalsData);
      if (ideasData.length > 0) setSelectedId(ideasData[0]!.id);
    }).catch(() => setFetchError("Failed to load repository data. Please try again."));
  }, [canAccess]);

  const approvalByIdeaId = useMemo(() => {
    const map = new Map<string, ManagerApprovalResponse>();
    approvals.forEach((a) => map.set(a.idea_id, a));
    return map;
  }, [approvals]);

  const filtered = useMemo(() => {
    if (!ideas) return null;
    return ideas.filter((idea) => {
      if (!matchesFilter(idea.status, filter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          idea.submission_number.toLowerCase().includes(q) ||
          idea.submitter_name.toLowerCase().includes(q) ||
          (idea.idea_title ?? "").toLowerCase().includes(q) ||
          idea.category.toLowerCase().includes(q) ||
          (idea.benefit ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ideas, filter, search]);

  const selectedIdea = useMemo(
    () => ideas?.find((i) => i.id === selectedId) ?? null,
    [ideas, selectedId]
  );

  const totalAnnualValue = useMemo(
    () => (ideas ?? []).reduce((s, i) => s + (i.annual_estimate ?? 0), 0),
    [ideas]
  );
  const approvedCount = useMemo(
    () => (ideas ?? []).filter((i) => ["approved_l1", "approved_l2", "implemented"].includes(i.status)).length,
    [ideas]
  );
  const avgScore = useMemo(() => {
    const scored = (ideas ?? []).filter((i) => i.l2_weighted_score != null);
    if (!scored.length) return null;
    return scored.reduce((s, i) => s + i.l2_weighted_score!, 0) / scored.length;
  }, [ideas]);

  if (!canAccess) {
    return (
      <main className={styles.container}>
        <p className={styles.accessDenied}>You do not have permission to access the Repository.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          <div className={styles.statsBarTitle}>
            <span className={styles.statsBarTitleText}>Idea Repository</span>
          </div>
          <div className={styles.statsBarStats}>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{ideas?.length ?? "—"}</p>
              <p className={styles.statLabel}>Total Ideas</p>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <p className={styles.statValue}>{approvedCount || (ideas === null ? "—" : 0)}</p>
              <p className={styles.statLabel}>Approved</p>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <p className={`${styles.statValue} ${totalAnnualValue > 0 ? styles.statValueGreen : ""}`}>
                {ideas === null ? "—" : totalAnnualValue > 0 ? `₹ ${totalAnnualValue.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className={styles.statLabel}>Total Annual Value</p>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <p className={styles.statValue}>
                {avgScore != null ? `${Math.round(avgScore * 10)}%` : "—"}
              </p>
              <p className={styles.statLabel}>Avg L2 Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className={styles.layout}>

        {/* Left panel */}
        <aside className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <div className={styles.searchWrap}>
              <Search size={13} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search ideas…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch("")} type="button">
                  <X size={11} />
                </button>
              )}
            </div>
            <div className={styles.filterChips}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`${styles.filterChip} ${filter === f.value ? styles.filterChipActive : ""}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {filtered !== null && (
              <p className={styles.resultCount}>{filtered.length} idea{filtered.length !== 1 ? "s" : ""}</p>
            )}
          </div>

          <div className={styles.leftList}>
            {fetchError && <p className={styles.errorMsg}>{fetchError}</p>}
            {!fetchError && filtered === null && (
              <>{[1, 2, 3, 4, 5].map((n) => <div key={n} className={styles.skeletonRow} />)}</>
            )}
            {filtered !== null && filtered.length === 0 && (
              <p className={styles.emptyMsg}>No ideas match your filters.</p>
            )}
            {filtered?.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                selected={selectedId === idea.id}
                onClick={() => setSelectedId(idea.id)}
              />
            ))}
          </div>
        </aside>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          {selectedIdea ? (
            <DetailPanel
              key={selectedIdea.id}
              idea={selectedIdea}
              reviewer={approvalByIdeaId.get(selectedIdea.id)}
            />
          ) : (
            <div className={styles.emptyDetail}>
              <p className={styles.emptyDetailText}>Select an idea from the list to view its details.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
