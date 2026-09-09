"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getCategories, type CategoryResponse } from "@/services/categoryService";
import { submitIdea } from "@/services/ideaService";
import type { IdeaResponse } from "@/types/idea";
import styles from "./submit.module.css";

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
  ideaTitle: string;
  benefit: string;
  patentSearchDone: "yes" | "no" | "not_applicable" | "";
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
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [form, setForm] = useState<DescribeForm>({
    problem: "",
    idea: "",
    ideaTitle: "",
    benefit: "",
    patentSearchDone: "",
    patentLink: "",
    pcblFunction: "",
    pcblFunctionOther: "",
    annualEstimate: "",
    additionalInfo: "",
    submitterName: userProfile?.name ?? "",
    submitterEmail: userProfile?.email ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<IdeaResponse | null>(null);

  function patch(field: keyof DescribeForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const describeValid =
    form.problem.trim().length > 0 &&
    form.idea.trim().length > 0 &&
    form.ideaTitle.trim().length > 0 &&
    form.benefit.trim().length > 0 &&
    form.patentSearchDone !== "" &&
    form.pcblFunction !== "" &&
    (form.pcblFunction !== "Other" || form.pcblFunctionOther.trim().length > 0) &&
    form.submitterName.trim().length > 0 &&
    form.submitterEmail.trim().length > 0;

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitIdea({
        category: category!,
        problem: form.problem,
        idea_description: form.idea,
        idea_title: form.ideaTitle,
        benefit: form.benefit,
        patent_search_done: form.patentSearchDone === "yes",
        ...(form.patentSearchDone === "yes" && form.patentLink ? { patent_link: form.patentLink } : {}),
        pcbl_function: form.pcblFunction,
        ...(form.pcblFunction === "Other" && form.pcblFunctionOther ? { pcbl_function_other: form.pcblFunctionOther } : {}),
        ...(form.annualEstimate ? { annual_estimate: parseFloat(form.annualEstimate) } : {}),
        ...(form.additionalInfo ? { additional_info: form.additionalInfo } : {}),
      });
      setSubmitted(result);
    } catch {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function stepBubbleClass(n: number) {
    if (n < step) return `${styles.stepBubble} ${styles.stepBubbleDone}`;
    if (n === step) return `${styles.stepBubble} ${styles.stepBubbleActive}`;
    return `${styles.stepBubble} ${styles.stepBubbleInactive}`;
  }

  function stepLabelClass(n: number) {
    if (n <= step) return `${styles.stepLabel} ${styles.stepLabelActive}`;
    return `${styles.stepLabel} ${styles.stepLabelInactive}`;
  }

  // ── Success screen ──────────────────────────────────────
  if (submitted) {
    return (
      <main className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Idea submitted!</h2>
            <p className={styles.successDesc}>
              Your idea has been recorded and routed to the appropriate reviewer.
            </p>
            <div className={styles.successMeta}>
              <span className={styles.successLabel}>Submission number</span>
              <span className={styles.successNumber}>{submitted.submission_number}</span>
            </div>
            <div className={styles.successMeta}>
              <span className={styles.successLabel}>Submitted by</span>
              <span className={styles.successValue}>{submitted.submitter_name} ({submitted.submitter_email})</span>
            </div>
            <div className={styles.successMeta}>
              <span className={styles.successLabel}>Category</span>
              <span className={styles.successValue}>{submitted.category}</span>
            </div>
            <div className={styles.successMeta}>
              <span className={styles.successLabel}>PCBL Function</span>
              <span className={styles.successValue}>
                {submitted.pcbl_function === "Other" ? submitted.pcbl_function_other : submitted.pcbl_function}
              </span>
            </div>
            <button
              className={styles.continueBtn}
              onClick={() => {
                setSubmitted(null);
                setStep(1);
                setCategory(null);
                setForm({
                  problem: "", idea: "", ideaTitle: "", benefit: "",
                  patentSearchDone: "", patentLink: "",
                  pcblFunction: "", pcblFunctionOther: "", annualEstimate: "",
                  additionalInfo: "",
                  submitterName: userProfile?.name ?? "",
                  submitterEmail: userProfile?.email ?? "",
                });
              }}
            >
              Submit another idea
            </button>
          </div>
        </div>
      </main>
    );
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
            <span className={stepBubbleClass(1)}>{step > 1 ? "✓" : "1"}</span>
            <span className={stepLabelClass(1)}>Categorize</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.step}>
            <span className={stepBubbleClass(2)}>{step > 2 ? "✓" : "2"}</span>
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
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryCard} ${category === cat.name ? styles.categoryCardSelected : ""}`}
                    onClick={() => setCategory(cat.name)}
                  >
                    {cat.name}
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

            {/* Idea title */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Idea title <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Give your idea a concise, descriptive title.
              </p>
              <input
                type="text"
                className={styles.textInput}
                placeholder="Enter a short title for your idea…"
                maxLength={150}
                value={form.ideaTitle}
                onChange={(e) => patch("ideaTitle", e.target.value)}
              />
              <span className={styles.charCount}>{form.ideaTitle.length}/150</span>
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
              <span className={styles.charCount}>{form.problem.length}/250</span>
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
              <span className={styles.charCount}>{form.idea.length}/500</span>
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
                    className={`${styles.categoryCard} ${form.pcblFunction === fn ? styles.categoryCardSelected : ""}`}
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
                {(["yes", "no", "not_applicable"] as const).map((val) => (
                  <label key={val} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="patentSearch"
                      value={val}
                      checked={form.patentSearchDone === val}
                      onChange={() => {
                        patch("patentSearchDone", val);
                        if (val !== "yes") patch("patentLink", "");
                      }}
                      className={styles.radioNative}
                    />
                    <span className={`${styles.radioCustom} ${form.patentSearchDone === val ? styles.radioCustomChecked : ""}`} />
                    <span className={styles.radioLabel}>
                      {val === "yes" ? "Yes" : val === "no" ? "No" : "Not Applicable"}
                    </span>
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
                    Paste a link to your search results or potential blocking patents.
                  </p>
                </div>
              )}
            </div>

            {/* Benefit */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Benefit <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Describe the key benefit(s) this idea will deliver to PCBL Chemical.
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Outline the expected benefits…"
                maxLength={500}
                rows={4}
                value={form.benefit}
                onChange={(e) => patch("benefit", e.target.value)}
              />
              <span className={styles.charCount}>{form.benefit.length}/500</span>
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
                placeholder="Any supporting context, references, or notes…"
                maxLength={250}
                rows={3}
                value={form.additionalInfo}
                onChange={(e) => patch("additionalInfo", e.target.value)}
              />
              <span className={styles.charCount}>{form.additionalInfo.length}/250</span>
            </div>

            {/* Submitter info */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Your details</label>
              <p className={styles.fieldHint}>
                Pre-filled from your session. Will be fetched automatically from SSO once configured.
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
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
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

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className={styles.formSection}>
            <div>
              <h2 className={styles.formTitle}>Review your submission</h2>
              <p className={styles.formSubtitle}>Confirm the details below before submitting.</p>
            </div>

            <div className={styles.reviewGrid}>
              <ReviewRow label="Category" value={category!} highlight />
              <ReviewRow label="PCBL Function"
                value={form.pcblFunction === "Other" ? `Other — ${form.pcblFunctionOther}` : form.pcblFunction}
              />
              <ReviewRow label="Idea title" value={form.ideaTitle} />
              <ReviewRow label="Problem statement" value={form.problem} />
              <ReviewRow label="Idea description" value={form.idea} />
              <ReviewRow label="Benefit" value={form.benefit} />
              <ReviewRow label="Patent search done" value={form.patentSearchDone === "yes" ? "Yes" : form.patentSearchDone === "not_applicable" ? "Not Applicable" : "No"} />
              {form.patentSearchDone === "yes" && form.patentLink && (
                <ReviewRow label="Patent link" value={form.patentLink} />
              )}
              {form.annualEstimate && (
                <ReviewRow label="Annual estimate" value={`₹ ${parseFloat(form.annualEstimate).toLocaleString("en-IN")}`} />
              )}
              {form.additionalInfo && (
                <ReviewRow label="Additional info" value={form.additionalInfo} />
              )}
              <ReviewRow label="Submitted by" value={`${form.submitterName} (${form.submitterEmail})`} />
            </div>

            <div className={styles.reviewNotice}>
              <span className={styles.reviewNoticeIcon}>ⓘ</span>
              <p className={styles.reviewNoticeText}>
                Submissions cannot be edited after this point. Your idea will enter Level 1 manager review, then
                proceed to the <span className={styles.infoHighlight}>{category}</span> group panel if approved.
              </p>
            </div>

            {submitError && (
              <p className={styles.errorMsg}>{submitError}</p>
            )}

            <div className={styles.navRow}>
              <button type="button" className={styles.backBtn} onClick={() => setStep(2)} disabled={submitting}>
                ← Back
              </button>
              <button
                type="button"
                className={styles.continueBtn}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting…" : "Submit Idea →"}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={highlight ? styles.reviewValueHighlight : styles.reviewValue}>{value}</span>
    </div>
  );
}
