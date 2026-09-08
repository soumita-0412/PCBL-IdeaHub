"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
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

function getL1(s: IdeaStatus): { label: string; cls: string; progress: number } {
  switch (s) {
    case "submitted":       return { label: "Pending",  cls: styles.dotAmber!,  progress: 0 };
    case "under_review_l1": return { label: "Pending",  cls: styles.dotAmber!,  progress: 50 };
    case "rejected_l1":
    case "rejected_l2":     return { label: "Rejected", cls: styles.dotRed!,    progress: 100 };
    default:                return { label: "Approved", cls: styles.dotGreen!,  progress: 100 };
  }
}

function getL2(s: IdeaStatus): { label: string; cls: string; progress: number } {
  switch (s) {
    case "submitted":
    case "under_review_l1":
    case "rejected_l1":     return { label: "Locked",   cls: styles.dotLocked!, progress: 0 };
    case "approved_l1":
    case "under_review_l2": return { label: "Pending",  cls: styles.dotAmber!,  progress: 50 };
    case "rejected_l2":     return { label: "Rejected", cls: styles.dotRed!,    progress: 100 };
    default:                return { label: "Approved", cls: styles.dotGreen!,  progress: 100 };
  }
}

function popupStatusStyle(s: IdeaStatus): { label: string; dotCls: string; textCls: string } {
  switch (s) {
    case "submitted":       return { label: "Submitted",    dotCls: styles.statusDotBlue!,  textCls: styles.statusTextBlue! };
    case "under_review_l1":
    case "under_review_l2": return { label: "Under Review", dotCls: styles.statusDotAmber!, textCls: styles.statusTextAmber! };
    case "approved_l1":
    case "approved_l2":
    case "implemented":     return { label: "Approved",     dotCls: styles.statusDotGreen!, textCls: styles.statusTextGreen! };
    case "rejected_l1":
    case "rejected_l2":     return { label: "Declined",     dotCls: styles.statusDotRed!,   textCls: styles.statusTextRed! };
  }
}

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
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

            {/* Close button */}
            <button className={styles.popupClose} onClick={closeModal} aria-label="Close">
              <X size={16} />
            </button>

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

            {selected && !modalLoading && (() => {
              const l1 = getL1(selected.status);
              const l2 = getL2(selected.status);
              const st = popupStatusStyle(selected.status);
              const date = new Date(selected.created_at).toISOString().slice(0, 10);
              const l1BarCls = l1.label === "Rejected" ? styles.barRed : styles.barGreen;
              const l2BarCls = l2.label === "Rejected" ? styles.barRed : l2.label === "Locked" ? styles.barLocked : styles.barPurple;

              return (
                <div className={styles.popupContent}>
                  {/* Header block — spans both columns */}
                  <div className={styles.popupHeader}>
                    <div className={styles.popupTopRow}>
                      <span className={styles.popupMeta}>
                        {selected.submission_number}&nbsp;·&nbsp;{date}
                      </span>
                      <span className={styles.popupStatus}>
                        <span className={`${styles.statusDot} ${st.dotCls}`} />
                        <span className={`${styles.statusText} ${st.textCls}`}>{st.label}</span>
                      </span>
                    </div>
                    <h2 className={styles.popupTitle}>{selected.category}</h2>
                    <p className={styles.popupSubtitle}>{selected.pcbl_function}</p>
                  </div>

                  {/* Review Progress — spans both columns */}
                  <div className={styles.sectionCardFull}>
                    <p className={styles.sectionLabel}>Review Progress</p>
                    <div className={styles.reviewLevels}>
                      <div className={styles.reviewLevel}>
                        <div className={styles.reviewLevelRow}>
                          <span className={styles.reviewLevelName}>Level 1 — Manager</span>
                          <span className={`${styles.reviewBadge} ${
                            l1.label === "Approved" ? styles.reviewBadgeGreen :
                            l1.label === "Rejected" ? styles.reviewBadgeRed :
                            styles.reviewBadgeAmber
                          }`}>{l1.label}</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div
                            className={`${styles.progressFill} ${l1BarCls}`}
                            style={{ width: `${l1.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className={styles.reviewLevel}>
                        <div className={styles.reviewLevelRow}>
                          <span className={styles.reviewLevelName}>Level 2 — Group</span>
                          <span className={`${styles.reviewBadge} ${
                            l2.label === "Approved" ? styles.reviewBadgeGreen :
                            l2.label === "Rejected" ? styles.reviewBadgeRed :
                            l2.label === "Locked"   ? styles.reviewBadgeLocked :
                            styles.reviewBadgeAmber
                          }`}>{l2.label}</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div
                            className={`${styles.progressFill} ${l2BarCls}`}
                            style={{ width: `${l2.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description — half width */}
                  <div className={styles.sectionCard}>
                    <p className={styles.sectionLabel}>Description</p>
                    <p className={styles.sectionText}>{selected.idea_description}</p>
                  </div>

                  {/* Problem Statement */}
                  <div className={styles.sectionCard}>
                    <p className={styles.sectionLabel}>Problem Statement</p>
                    <p className={styles.sectionText}>{selected.problem}</p>
                  </div>

                  {/* PCBL Function */}
                  <div className={styles.sectionCard}>
                    <p className={styles.sectionLabel}>PCBL Function</p>
                    <p className={styles.sectionText}>
                      {selected.pcbl_function === "Other" && selected.pcbl_function_other
                        ? `Other — ${selected.pcbl_function_other}`
                        : selected.pcbl_function}
                    </p>
                  </div>

                  {/* Patent */}
                  <div className={styles.sectionCard}>
                    <p className={styles.sectionLabel}>Patent Search</p>
                    <p className={styles.sectionText}>
                      {selected.patent_search_done ? "Yes" : "No"}
                      {selected.patent_link && (
                        <> — <a href={selected.patent_link} target="_blank" rel="noopener noreferrer" className={styles.link}>{selected.patent_link}</a></>
                      )}
                    </p>
                  </div>

                  {/* Annual Estimate */}
                  {selected.annual_estimate != null && (
                    <div className={styles.sectionCard}>
                      <p className={styles.sectionLabel}>Estimated Savings</p>
                      <p className={styles.sectionText}>
                        ₹ {selected.annual_estimate.toLocaleString("en-IN")} annual
                      </p>
                    </div>
                  )}

                  {/* Additional Info — spans full */}
                  {selected.additional_info && (
                    <div className={styles.sectionCardFull}>
                      <p className={styles.sectionLabel}>Additional Info</p>
                      <p className={styles.sectionText}>{selected.additional_info}</p>
                    </div>
                  )}

                  {/* Submitted by — spans full */}
                  <div className={styles.sectionCardFull}>
                    <p className={styles.sectionLabel}>Submitted By</p>
                    <p className={styles.sectionText}>
                      {selected.submitter_name} — {selected.submitter_email}
                    </p>
                    <p className={styles.sectionMuted}>
                      {new Date(selected.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
