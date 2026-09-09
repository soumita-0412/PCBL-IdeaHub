"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { getAllIdeas } from "@/services/ideaService";
import { getAllManagerApprovals } from "@/services/managerApprovalService";
import { getGroupReviews } from "@/services/groupReviewService";
import type { IdeaResponse, IdeaStatus } from "@/types/idea";
import type { ManagerApprovalResponse } from "@/types/managerApproval";
import type { GroupReviewResponse } from "@/types/groupReview";
import { hasMinRole, Roles } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth.store";
import styles from "./repository.module.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusMeta(s: IdeaStatus): { label: string; dotCls: string; textCls: string } {
  switch (s) {
    case "submitted":       return { label: "Submitted",    dotCls: styles.dotBlue!,  textCls: styles.textBlue! };
    case "under_review_l1": return { label: "Under Review", dotCls: styles.dotAmber!, textCls: styles.textAmber! };
    case "under_review_l2": return { label: "Under Review", dotCls: styles.dotAmber!, textCls: styles.textAmber! };
    case "approved_l1":     return { label: "Approved",     dotCls: styles.dotGreen!, textCls: styles.textGreen! };
    case "approved_l2":     return { label: "Approved",     dotCls: styles.dotGreen!, textCls: styles.textGreen! };
    case "implemented":     return { label: "Implemented",  dotCls: styles.dotGreen!, textCls: styles.textGreen! };
    case "rejected_l1":     return { label: "Declined",     dotCls: styles.dotRed!,   textCls: styles.textRed! };
    case "rejected_l2":     return { label: "Declined",     dotCls: styles.dotRed!,   textCls: styles.textRed! };
  }
}

const STATUS_OPTIONS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
] as const;
type FilterValue = (typeof STATUS_OPTIONS)[number]["value"];

function matchesFilter(status: IdeaStatus, f: FilterValue): boolean {
  if (f === "all") return true;
  if (f === "pending")  return ["submitted", "under_review_l1", "under_review_l2", "approved_l1"].includes(status);
  if (f === "approved") return ["approved_l1", "approved_l2", "implemented"].includes(status);
  if (f === "declined") return ["rejected_l1", "rejected_l2"].includes(status);
  return true;
}

// ── Score circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const pct = Math.min(100, Math.round(score * 10));
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className={styles.scoreCircleSvg}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="#f0eaf5" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text
        x="28" y="29"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fill="#111827"
        fontFamily="Cambria Math, Cambria, Georgia, serif"
      >
        {pct}
      </text>
    </svg>
  );
}

// ── Idea card ─────────────────────────────────────────────────────────────────

interface IdeaCardProps {
  idea: IdeaResponse;
  l1Approval: ManagerApprovalResponse | undefined;
  groupReview: GroupReviewResponse | undefined;
}

function IdeaCard({ idea, l1Approval, groupReview }: IdeaCardProps) {
  const { label, dotCls, textCls } = statusMeta(idea.status);
  const date = new Date(idea.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const reviewer = groupReview?.reviewed_by_name ?? l1Approval?.reviewed_by_name ?? null;
  const hasScore = idea.l2_weighted_score != null;

  return (
    <div className={styles.card}>
      <div className={styles.cardLayout}>

        {/* Left: all content */}
        <div className={styles.cardMain}>
          <div className={styles.cardTopRow}>
            <span className={styles.cardMeta}>
              {idea.submission_number}&ensp;·&ensp;{idea.category}&ensp;·&ensp;{date}
            </span>
            <span className={`${styles.statusBadge} ${textCls}`}>
              <span className={`${styles.statusDot} ${dotCls}`} />
              {label}
            </span>
          </div>

          <h3 className={styles.cardTitle}>{idea.idea_title ?? idea.category}</h3>
          <p className={styles.cardDesc}>{idea.idea_description}</p>

          <div className={styles.cardChips}>
            {idea.benefit && (
              <div className={styles.chipBox}>
                <span className={styles.chipBoxLabel}>Benefits</span>
                <span className={styles.chipBoxText}>{idea.benefit}</span>
              </div>
            )}
            {idea.annual_estimate != null && (
              <div className={`${styles.chipBox} ${styles.chipBoxSavings}`}>
                <span className={styles.chipBoxLabelSavings}>Savings</span>
                <span className={styles.chipBoxValue}>
                  ₹ {idea.annual_estimate.toLocaleString("en-IN")} annual
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: score pinned to top */}
        {(hasScore || reviewer) && (
          <div className={styles.cardScore}>
            {hasScore && <ScoreCircle score={idea.l2_weighted_score!} />}
            {reviewer && <span className={styles.cardReviewer}>{reviewer}</span>}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RepositoryPage() {
  const { userProfile } = useAuthStore();
  const [ideas, setIdeas]               = useState<IdeaResponse[] | null>(null);
  const [approvals, setApprovals]       = useState<ManagerApprovalResponse[]>([]);
  const [groupReviews, setGroupReviews] = useState<GroupReviewResponse[]>([]);
  const [filter, setFilter]             = useState<FilterValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch]             = useState("");
  const [fetchError, setFetchError]     = useState<string | null>(null);

  const canAccess = hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER);

  useEffect(() => {
    if (!canAccess) return;
    Promise.all([
      getAllIdeas(),
      getAllManagerApprovals().catch(() => [] as ManagerApprovalResponse[]),
      getGroupReviews().catch(() => [] as GroupReviewResponse[]),
    ]).then(([ideasData, approvalsData, grData]) => {
      setIdeas(ideasData);
      setApprovals(approvalsData);
      setGroupReviews(grData);
    }).catch(() => setFetchError("Failed to load repository data. Please try again."));
  }, [canAccess]);

  const approvalByIdeaId = useMemo(() => {
    const map = new Map<string, ManagerApprovalResponse>();
    approvals.forEach((a) => map.set(a.idea_id, a));
    return map;
  }, [approvals]);

  const groupReviewByIdeaId = useMemo(() => {
    const map = new Map<string, GroupReviewResponse>();
    groupReviews.forEach((gr) => map.set(gr.idea_id, gr));
    return map;
  }, [groupReviews]);

  const categories = useMemo(
    () => ideas ? Array.from(new Set(ideas.map((i) => i.category))).sort() : [],
    [ideas]
  );

  const filtered = useMemo(() => {
    if (!ideas) return null;
    return ideas.filter((idea) => {
      if (!matchesFilter(idea.status, filter)) return false;
      if (categoryFilter !== "all" && idea.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          idea.submission_number.toLowerCase().includes(q) ||
          idea.submitter_name.toLowerCase().includes(q) ||
          (idea.idea_title ?? "").toLowerCase().includes(q) ||
          idea.category.toLowerCase().includes(q) ||
          (idea.benefit ?? "").toLowerCase().includes(q) ||
          idea.idea_description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ideas, filter, categoryFilter, search]);

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
      <div className={styles.inner}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Knowledge Repository</h1>
          <p className={styles.pageSubtitle}>
            Searchable archive of ideas and outcomes. Declined ideas display anonymously.
          </p>
        </div>


        {/* Search + filters */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search ideas, solutions, outcomes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className={styles.searchClear} onClick={() => setSearch("")}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterValue)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className={styles.selectChevron} />
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={13} className={styles.selectChevron} />
          </div>
        </div>

        {/* Card list */}
        <div className={styles.cardList}>
          {fetchError && <p className={styles.errorMsg}>{fetchError}</p>}

          {!fetchError && filtered === null && (
            <>{[1, 2, 3].map((n) => <div key={n} className={styles.skeletonCard} />)}</>
          )}

          {filtered !== null && filtered.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No ideas match your filters.</p>
            </div>
          )}

          {filtered?.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              l1Approval={approvalByIdeaId.get(idea.id)}
              groupReview={groupReviewByIdeaId.get(idea.id)}
            />
          ))}
        </div>

      </div>
    </main>
  );
}
