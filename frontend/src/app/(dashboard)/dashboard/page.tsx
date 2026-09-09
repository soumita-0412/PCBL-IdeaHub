"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getDashboardStats,
  getRecentIdeas,
  type DashboardStats,
  type PaginatedIdeas,
} from "@/services/dashboardService";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ideas, setIdeas] = useState<PaginatedIdeas | null>(null);
  const [page, setPage] = useState(1);
  const [ideasLoading, setIdeasLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setIdeasLoading(true);
    getRecentIdeas(page)
      .then(setIdeas)
      .catch(() => {})
      .finally(() => setIdeasLoading(false));
  }, [page]);

  const monthly = stats?.monthly_submissions ?? [];
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const funnel = stats?.by_function_funnel ?? [];
  const maxSubmitted = Math.max(...funnel.map((f) => f.submitted), 1);

  return (
    <main className={styles.container}>
      <div className={styles.inner}>

        {/* ── Stats ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>TOTAL SUBMITTED</p>
            <p className={`${styles.statValue} ${styles.valBlack}`}>
              {stats?.total_submitted ?? "—"}
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>MANAGER APPROVED</p>
            <p className={`${styles.statValue} ${styles.valPurple}`}>
              {stats?.manager_approved ?? "—"}
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>GROUP APPROVED</p>
            <p className={`${styles.statValue} ${styles.valGreen}`}>
              {stats?.group_approved ?? "—"}
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>IMPLEMENTED</p>
            <p className={`${styles.statValue} ${styles.valGreen}`}>
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
                        style={{ height: `${Math.max(4, (m.count / maxCount) * 120)}px` }}
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
                    <div key={i} className={styles.funnelRow}>
                      <span className={styles.funnelCat}>{f.category}</span>
                      <div className={styles.funnelTrack}>
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.submitted / maxSubmitted) * 100}%`,
                            background: "#e5e7eb",
                          }}
                        />
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.l1_approved / maxSubmitted) * 100}%`,
                            background: "#890892",
                            opacity: 0.75,
                          }}
                        />
                        <div
                          className={styles.fBar}
                          style={{
                            width: `${(f.l2_approved / maxSubmitted) * 100}%`,
                            background: "#81c451",
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
                <span className={styles.legendDot} style={{ background: "#e5e7eb" }} />
                Submitted
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#890892" }} />
                L1 Approved
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#81c451" }} />
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
              <div key={idea.id} className={styles.tRow}>
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
                  <span
                    className={`${styles.badge} ${
                      styles[STATUS_CLS[idea.status] ?? "badgeBlue"]
                    }`}
                  >
                    {STATUS_LABELS[idea.status] ?? idea.status}
                  </span>
                </span>
                <span className={styles.l2Score}>
                  {idea.l2_score != null ? (
                    <span className={styles.scoreCircle}>
                      {Math.round(idea.l2_score)}
                    </span>
                  ) : (
                    <span className={styles.scoreDash}>—</span>
                  )}
                </span>
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
  );
}
