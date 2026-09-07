"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { getMyStats, type IdeaStats } from "@/services/ideaService";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [stats, setStats] = useState<IdeaStats | null>(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(() => {
      setStats({ total: 0, in_review: 0, approved: 0 });
    });
  }, []);

  const total    = stats?.total    ?? "—";
  const inReview = stats?.in_review ?? "—";
  const approved = stats?.approved  ?? "—";

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        {/* Welcome banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerIcon}><Lightbulb size={16} /></div>
          <div>
            <p className={styles.bannerTitle}>Welcome to IdeaPortal</p>
            <p className={styles.bannerDesc}>
              Submit and track ideas through the two-stage review process —
              Level 1 manager approval, then Level 2 group scoring.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className={styles.sectionHeading}>Your activity</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Submitted</p>
              <p className={styles.statValue}>{total}</p>
              <p className={styles.statSubtext}>ideas total</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>In review</p>
              <p className={styles.statValue}>{inReview}</p>
              <p className={styles.statSubtext}>pending approval</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Approved</p>
              <p className={styles.statValue}>{approved}</p>
              <p className={styles.statSubtext}>ideas approved</p>
            </div>
          </div>
        </div>

        {/* Quick action */}
        <div className={styles.actionCard}>
          <div className={styles.actionText}>
            <p className={styles.actionTitle}>Got a new idea?</p>
            <p className={styles.actionDesc}>
              Submit it now and route it to the right reviewers automatically.
            </p>
          </div>
          <Link href="/submit" className={styles.actionBtn}>Submit Idea →</Link>
        </div>
      </div>
    </main>
  );
}
