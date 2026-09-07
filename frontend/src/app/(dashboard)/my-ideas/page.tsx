"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyIdeas } from "@/services/ideaService";
import type { IdeaListItem, IdeaStatus } from "@/types/idea";
import styles from "./my-ideas.module.css";

const STATUS_LABEL: Record<IdeaStatus, string> = {
  submitted:        "Submitted",
  under_review_l1:  "L1 Review",
  approved_l1:      "L1 Approved",
  rejected_l1:      "L1 Rejected",
  under_review_l2:  "L2 Review",
  approved_l2:      "L2 Approved",
  rejected_l2:      "L2 Rejected",
  implemented:      "Implemented",
};

const STATUS_VARIANT: Record<IdeaStatus, string> = {
  submitted:        styles.badgeNeutral,
  under_review_l1:  styles.badgeBlue,
  approved_l1:      styles.badgeGreen,
  rejected_l1:      styles.badgeRed,
  under_review_l2:  styles.badgeBlue,
  approved_l2:      styles.badgeGreen,
  rejected_l2:      styles.badgeRed,
  implemented:      styles.badgeAmber,
};

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<IdeaListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyIdeas()
      .then(setIdeas)
      .catch(() => setError("Failed to load your ideas. Please try again."));
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Ideas</h1>
            <p className={styles.subtitle}>Track all ideas you have submitted.</p>
          </div>
          <Link href="/submit" className={styles.submitBtn}>
            + Submit Idea
          </Link>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        {!error && ideas === null && (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonRow} />
            ))}
          </div>
        )}

        {ideas !== null && ideas.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No ideas yet</p>
            <p className={styles.emptyDesc}>
              Submit your first idea and track its progress here.
            </p>
            <Link href="/submit" className={styles.emptyBtn}>
              Submit your first idea →
            </Link>
          </div>
        )}

        {ideas !== null && ideas.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Function</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {idea.submission_number}
                    </td>
                    <td className={styles.td}>{idea.category}</td>
                    <td className={styles.td}>{idea.pcbl_function}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${STATUS_VARIANT[idea.status]}`}>
                        {STATUS_LABEL[idea.status]}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {new Date(idea.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}
