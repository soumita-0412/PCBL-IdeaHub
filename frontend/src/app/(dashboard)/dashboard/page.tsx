import Link from "next/link";
import { Lightbulb } from "lucide-react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.container}>
      <div className={styles.inner}>

        {/* Welcome banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerIcon}>
            <Lightbulb size={16} />
          </div>
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
              <p className={styles.statValue}>0</p>
              <p className={styles.statSubtext}>ideas total</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>In review</p>
              <p className={styles.statValue}>0</p>
              <p className={styles.statSubtext}>pending approval</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Approved</p>
              <p className={styles.statValue}>0</p>
              <p className={styles.statSubtext}>this quarter</p>
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
          <Link href="/submit" className={styles.actionBtn}>
            Submit Idea →
          </Link>
        </div>

      </div>
    </main>
  );
}
