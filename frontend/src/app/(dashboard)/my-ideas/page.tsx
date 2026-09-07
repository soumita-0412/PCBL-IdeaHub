"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMyIdeas, getIdeaById } from "@/services/ideaService";
import type { IdeaListItem, IdeaResponse, IdeaStatus } from "@/types/idea";
import styles from "./my-ideas.module.css";

function getCardStatus(s: IdeaStatus): { label: string; cls: string } {
  switch (s) {
    case "submitted":       return { label: "Submitted",    cls: styles.badgeBlue! };
    case "under_review_l1":
    case "under_review_l2": return { label: "Under Review", cls: styles.badgeAmber! };
    case "approved_l1":
    case "approved_l2":
    case "implemented":     return { label: "Approved",     cls: styles.badgeGreen! };
    case "rejected_l1":
    case "rejected_l2":     return { label: "Declined",     cls: styles.badgeRed! };
  }
}

function getL1(s: IdeaStatus): { label: string; cls: string } {
  switch (s) {
    case "submitted":
    case "under_review_l1": return { label: "Pending",  cls: styles.dotAmber! };
    case "rejected_l1":
    case "rejected_l2":     return { label: "Rejected", cls: styles.dotRed! };
    default:                return { label: "Approved", cls: styles.dotGreen! };
  }
}

function getL2(s: IdeaStatus): { label: string; cls: string } {
  switch (s) {
    case "submitted":
    case "under_review_l1":
    case "rejected_l1":     return { label: "Locked",   cls: styles.dotLocked! };
    case "approved_l1":
    case "under_review_l2": return { label: "Pending",  cls: styles.dotAmber! };
    case "rejected_l2":     return { label: "Rejected", cls: styles.dotRed! };
    default:                return { label: "Approved", cls: styles.dotGreen! };
  }
}

const STATUS_VARIANT: Record<IdeaStatus, string> = {
  submitted:       styles.badgeNeutral!,
  under_review_l1: styles.badgeBlue!,
  approved_l1:     styles.badgeGreen!,
  rejected_l1:     styles.badgeRed!,
  under_review_l2: styles.badgeBlue!,
  approved_l2:     styles.badgeGreen!,
  rejected_l2:     styles.badgeRed!,
  implemented:     styles.badgeAmber!,
};

const STATUS_LABEL: Record<IdeaStatus, string> = {
  submitted:       "Submitted",
  under_review_l1: "L1 Review",
  approved_l1:     "L1 Approved",
  rejected_l1:     "L1 Rejected",
  under_review_l2: "L2 Review",
  approved_l2:     "L2 Approved",
  rejected_l2:     "L2 Rejected",
  implemented:     "Implemented",
};

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<IdeaListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IdeaResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    getMyIdeas()
      .then(setIdeas)
      .catch(() => setError("Failed to load your ideas. Please try again."));
  }, []);

  const openModal = useCallback(async (id: string) => {
    setSelected(null);
    setModalError(null);
    setModalLoading(true);
    try {
      const idea = await getIdeaById(id);
      setSelected(idea);
    } catch {
      setModalError("Failed to load idea details.");
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
    setModalError(null);
    setModalLoading(false);
  }, []);

  useEffect(() => {
    if (!selected && !modalLoading) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, modalLoading, closeModal]);

  const modalOpen = modalLoading || !!selected || !!modalError;

  return (
    <main className={styles.container}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Submissions</h1>
            <p className={styles.subtitle}>Track your ideas through the two-stage review process</p>
          </div>
          <div className={styles.headerRight}>
            {ideas !== null && (
              <span className={styles.totalBadge}>{ideas.length} total</span>
            )}
            <Link href="/submit" className={styles.submitBtn}>+ Submit Idea</Link>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        {!error && ideas === null && (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((n) => <div key={n} className={styles.skeletonRow} />)}
          </div>
        )}

        {ideas !== null && ideas.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No ideas yet</p>
            <p className={styles.emptyDesc}>Submit your first idea and track its progress here.</p>
            <Link href="/submit" className={styles.emptyBtn}>Submit your first idea →</Link>
          </div>
        )}

        {ideas !== null && ideas.length > 0 && (
          <div className={styles.cardList}>
            {ideas.map((idea) => {
              const card = getCardStatus(idea.status);
              const l1   = getL1(idea.status);
              const l2   = getL2(idea.status);
              const date = new Date(idea.created_at).toISOString().slice(0, 10);
              return (
                <div
                  key={idea.id}
                  className={styles.card}
                  onClick={() => openModal(idea.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openModal(idea.id)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardMeta}>
                      {idea.submission_number}&nbsp;·&nbsp;{date}&nbsp;·&nbsp;{idea.category}
                    </span>
                    <span className={`${styles.badge} ${card.cls}`}>{card.label}</span>
                  </div>
                  <div className={styles.cardTitle}>{idea.category}</div>
                  <div className={styles.cardDesc}>{idea.pcbl_function}</div>
                  <div className={styles.cardFooter}>
                    <span className={`${styles.dot} ${l1.cls}`} />
                    <span className={styles.footerLabel}>L1: <strong>{l1.label}</strong></span>
                    <span className={styles.footerSep}>·</span>
                    <span className={`${styles.dot} ${l2.cls}`} />
                    <span className={styles.footerLabel}>L2: <strong>{l2.label}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            {modalLoading && (
              <div className={styles.modalLoading}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Loading…</p>
              </div>
            )}

            {modalError && !modalLoading && (
              <div className={styles.modalLoading}>
                <p className={styles.errorMsg}>{modalError}</p>
                <button className={styles.closeBtn} onClick={closeModal}>Close</button>
              </div>
            )}

            {selected && !modalLoading && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitleRow}>
                    <span className={styles.modalId}>{selected.submission_number}</span>
                    <span className={`${styles.badge} ${STATUS_VARIANT[selected.status]}`}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </div>
                  <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">✕</button>
                </div>

                <div className={styles.modalBody}>
                  <DetailRow label="Category"       value={selected.category} />
                  <DetailRow
                    label="PCBL Function"
                    value={
                      selected.pcbl_function === "Other" && selected.pcbl_function_other
                        ? `Other — ${selected.pcbl_function_other}`
                        : selected.pcbl_function
                    }
                  />
                  <DetailRow label="Problem statement" value={selected.problem} />
                  <DetailRow label="Idea description"  value={selected.idea_description} />
                  <DetailRow
                    label="Patent search"
                    value={selected.patent_search_done ? "Yes" : "No"}
                  />
                  {selected.patent_link && (
                    <DetailRow label="Patent link" value={selected.patent_link} />
                  )}
                  {selected.annual_estimate != null && (
                    <DetailRow
                      label="Annual estimate"
                      value={`₹ ${selected.annual_estimate.toLocaleString("en-IN")}`}
                    />
                  )}
                  {selected.additional_info && (
                    <DetailRow label="Additional info" value={selected.additional_info} />
                  )}
                  <DetailRow
                    label="Submitted by"
                    value={`${selected.submitter_name} (${selected.submitter_email})`}
                  />
                  <DetailRow
                    label="Date submitted"
                    value={new Date(selected.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  />
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
