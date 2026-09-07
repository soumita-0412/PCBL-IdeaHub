"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
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

const PCBL_FUNCTIONS = [
  "Energy",
  "Liquid Systems",
  "Polymers",
  "Tire and Rubber",
  "Process Technology",
  "Quality",
  "Human Resources",
  "Manufacturing",
  "Finance",
  "Legal",
  "Facilities",
  "Other",
];

interface DescribeForm {
  problem: string;
  idea: string;
  patentSearchDone: "yes" | "no" | "";
  patentLink: string;
  pcblFunction: string;
  pcblFunctionOther: string;
  annualEstimate: string;
  additionalInfo: string;
  submitterName: string;
  submitterEmail: string;
}

export default function SubmitIdeaPage() {
  const { userProfile } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [form, setForm] = useState<DescribeForm>({
    problem: "",
    idea: "",
    patentSearchDone: "",
    patentLink: "",
    pcblFunction: "",
    pcblFunctionOther: "",
    annualEstimate: "",
    additionalInfo: "",
    submitterName: userProfile?.name ?? "",
    submitterEmail: userProfile?.email ?? "",
  });

  function patch(field: keyof DescribeForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const describeValid =
    form.problem.trim().length > 0 &&
    form.idea.trim().length > 0 &&
    form.patentSearchDone !== "" &&
    form.pcblFunction !== "" &&
    (form.pcblFunction !== "Other" || form.pcblFunctionOther.trim().length > 0) &&
    form.submitterName.trim().length > 0 &&
    form.submitterEmail.trim().length > 0;

  function stepBubbleClass(n: number) {
    if (n < step) return `${styles.stepBubble} ${styles.stepBubbleDone}`;
    if (n === step) return `${styles.stepBubble} ${styles.stepBubbleActive}`;
    return `${styles.stepBubble} ${styles.stepBubbleInactive}`;
  }

  function stepLabelClass(n: number) {
    if (n <= step) return `${styles.stepLabel} ${styles.stepLabelActive}`;
    return `${styles.stepLabel} ${styles.stepLabelInactive}`;
  }

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
            <span className={stepBubbleClass(1)}>
              {step > 1 ? "✓" : "1"}
            </span>
            <span className={stepLabelClass(1)}>Categorize</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <span className={stepBubbleClass(2)}>
              {step > 2 ? "✓" : "2"}
            </span>
            <span className={stepLabelClass(2)}>Describe</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <span className={stepBubbleClass(3)}>3</span>
            <span className={stepLabelClass(3)}>Review</span>
          </div>
        </div>

        {/* ── Step 1: Categorize ── */}
        {step === 1 && (
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
                      category === cat ? styles.categoryCardSelected : ""
                    }`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={styles.continueBtn}
              disabled={!category}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Describe ── */}
        {step === 2 && (
          <div className={styles.formSection}>
            <div>
              <h2 className={styles.formTitle}>Describe your idea</h2>
              <p className={styles.formSubtitle}>
                Category: <span className={styles.infoHighlight}>{category}</span>
              </p>
            </div>

            {/* Problem statement */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Problem statement <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Please outline the problem that your idea will solve and/or the benefit it will bring to PCBL Chemical.
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Describe the problem or opportunity…"
                maxLength={250}
                rows={3}
                value={form.problem}
                onChange={(e) => patch("problem", e.target.value)}
              />
              <span className={styles.charCount}>
                {form.problem.length}/250
              </span>
            </div>

            {/* Idea description */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Idea description <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Describe in detail your idea and explain how it will solve the problem and/or provide the benefit.
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Explain your idea in detail…"
                maxLength={500}
                rows={5}
                value={form.idea}
                onChange={(e) => patch("idea", e.target.value)}
              />
              <span className={styles.charCount}>
                {form.idea.length}/500
              </span>
            </div>

            {/* PCBL Function */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                PCBL Function / Application Market <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                What specific Function within PCBL Chemical or Application/Market will your idea serve?
              </p>
              <div className={styles.functionGrid}>
                {PCBL_FUNCTIONS.map((fn) => (
                  <button
                    key={fn}
                    type="button"
                    className={`${styles.categoryCard} ${
                      form.pcblFunction === fn ? styles.categoryCardSelected : ""
                    }`}
                    onClick={() => {
                      patch("pcblFunction", fn);
                      if (fn !== "Other") patch("pcblFunctionOther", "");
                    }}
                  >
                    {fn}
                  </button>
                ))}
              </div>
              {form.pcblFunction === "Other" && (
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Please specify…"
                  value={form.pcblFunctionOther}
                  onChange={(e) => patch("pcblFunctionOther", e.target.value)}
                  maxLength={120}
                />
              )}
            </div>

            {/* Patent search */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Patent search completed? <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                If your idea is for a new product or process, have you performed a basic patent search (Google Patents) to determine what competing intellectual property might block PCBL Chemical from practising your idea?
              </p>
              <div className={styles.radioGroup}>
                {(["yes", "no"] as const).map((val) => (
                  <label key={val} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="patentSearch"
                      value={val}
                      checked={form.patentSearchDone === val}
                      onChange={() => {
                        patch("patentSearchDone", val);
                        if (val === "no") patch("patentLink", "");
                      }}
                      className={styles.radioNative}
                    />
                    <span className={`${styles.radioCustom} ${form.patentSearchDone === val ? styles.radioCustomChecked : ""}`} />
                    <span className={styles.radioLabel}>{val === "yes" ? "Yes" : "No"}</span>
                  </label>
                ))}
              </div>
              {form.patentSearchDone === "yes" && (
                <div className={styles.patentLinkWrap}>
                  <input
                    type="url"
                    className={styles.textInput}
                    placeholder="Paste link to search results or blocking patent…"
                    value={form.patentLink}
                    onChange={(e) => patch("patentLink", e.target.value)}
                  />
                  <p className={styles.inputNote}>
                    Upload or paste a link to your search results or potential blocking patents.
                  </p>
                </div>
              )}
            </div>

            {/* Annual estimate */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Annual value estimate (₹)</label>
              <p className={styles.fieldHint}>
                Please provide an estimate of how much money your idea can earn or save for PCBL Chemical on an annual basis.
              </p>
              <input
                type="number"
                className={styles.textInput}
                placeholder="e.g. 500000"
                min="0"
                value={form.annualEstimate}
                onChange={(e) => patch("annualEstimate", e.target.value)}
              />
            </div>

            {/* Additional info */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Additional information</label>
              <p className={styles.fieldHint}>
                Please share any other information that will assist with the review of your idea.
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Any supporting context, references, or attachments…"
                maxLength={250}
                rows={3}
                value={form.additionalInfo}
                onChange={(e) => patch("additionalInfo", e.target.value)}
              />
              <span className={styles.charCount}>
                {form.additionalInfo.length}/250
              </span>
            </div>

            {/* Submitter info */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Your details</label>
              <p className={styles.fieldHint}>
                Your name and email will be pre-filled automatically once SSO is configured.
              </p>
              <div className={styles.twoCol}>
                <div>
                  <p className={styles.subFieldLabel}>Name <span className={styles.required}>*</span></p>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="Full name"
                    value={form.submitterName}
                    onChange={(e) => patch("submitterName", e.target.value)}
                  />
                </div>
                <div>
                  <p className={styles.subFieldLabel}>Email address <span className={styles.required}>*</span></p>
                  <input
                    type="email"
                    className={styles.textInput}
                    placeholder="you@pcbl.com"
                    value={form.submitterEmail}
                    onChange={(e) => patch("submitterEmail", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className={styles.continueBtn}
                disabled={!describeValid}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review (placeholder) ── */}
        {step === 3 && (
          <div className={styles.formSection}>
            <div>
              <h2 className={styles.formTitle}>Review your submission</h2>
              <p className={styles.formSubtitle}>Coming soon — review &amp; submit step.</p>
            </div>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
