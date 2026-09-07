"use client";

import { useState } from "react";
import styles from "./submit.module.css";

const CATEGORIES = [
  "Cost Optimization",
  "Cyber Security",
  "Employee Experience",
  "Operations",
  "HR",
  "Finance",
  "IT",
  "Specialty Business",
  "Rubber Business",
  "Battery Business",
];

export default function SubmitIdeaPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className={styles.container}>
        <div className={styles.inner}>

          {/* Two-stage info banner */}
          <div className={styles.infoBanner}>
            <div className={styles.infoBadges}>
              <span className={styles.infoBadge}>1</span>
              <span className={styles.infoBadge}>2</span>
            </div>
            <div>
              <p className={styles.infoTitle}>Two-stage review process</p>
              <p className={styles.infoDesc}>
                Your idea goes through{" "}
                <span className={styles.infoHighlight}>Level 1 manager approval</span> first,
                then to{" "}
                <span className={styles.infoAccent}>Level 2 group scoring</span> if approved.
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={`${styles.stepBubble} ${styles.stepBubbleActive}`}>1</span>
              <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>Categorize</span>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <span className={`${styles.stepBubble} ${styles.stepBubbleInactive}`}>2</span>
              <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Describe</span>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <span className={`${styles.stepBubble} ${styles.stepBubbleInactive}`}>3</span>
              <span className={`${styles.stepLabel} ${styles.stepLabelInactive}`}>Review</span>
            </div>
          </div>

          {/* Category selection */}
          <div className={styles.formSection}>
            <div>
              <h2 className={styles.formTitle}>What type of idea is this?</h2>
              <p className={styles.formSubtitle}>
                Selecting a category routes your idea to the right managers and reviewers.
              </p>
            </div>

            <div className={styles.categoryGroup}>
              <p className={styles.categoryLabel}>Function / Category</p>
              <div className={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.categoryCard} ${
                      selected === cat ? styles.categoryCardSelected : ""
                    }`}
                    onClick={() => setSelected(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={styles.continueBtn}
              disabled={!selected}
            >
              Continue →
            </button>
          </div>

        </div>
    </main>
  );
}
