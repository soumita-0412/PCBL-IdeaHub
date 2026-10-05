"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryResponse,
  type CommitteePerson,
} from "@/services/categoryService";
import { UserSearchPicker } from "@/components/ui/UserSearchPicker";
import styles from "./admin.module.css";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message;
    if (msg) return msg;
  }
  return fallback;
}

// ── Local types ───────────────────────────────────────────────────────────────

interface MatrixOptionLocal {
  id: string;
  label: string;
  weight: number;
}

interface CategoryLocal {
  id: string;
  name: string;
  department: string;
  matrix: MatrixOptionLocal[];
  committee_lead: CommitteePerson | null;
  committee_members: CommitteePerson[];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newOption(): MatrixOptionLocal {
  return { id: uid(), label: "", weight: 0 };
}

function fromApi(cat: CategoryResponse): CategoryLocal {
  return {
    id: cat.id,
    name: cat.name,
    department: cat.department,
    matrix: cat.matrix.map((o) => ({ id: uid(), label: o.label, weight: o.weight })),
    committee_lead: cat.committee_lead ?? null,
    committee_members: cat.committee_members ?? [],
  };
}

function toApiMatrix(matrix: MatrixOptionLocal[]) {
  return matrix.map(({ label, weight }) => ({ label, weight }));
}

// ── Scoring matrix editor ─────────────────────────────────────────────────────

function MatrixEditor({
  options,
  onChange,
}: {
  options: MatrixOptionLocal[];
  onChange: (options: MatrixOptionLocal[]) => void;
}) {
  const total = options.reduce((s, o) => s + (o.weight || 0), 0);

  const add = () => onChange([...options, newOption()]);
  const remove = (id: string) => onChange(options.filter((o) => o.id !== id));
  const update = (id: string, field: "label" | "weight", value: string | number) =>
    onChange(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));

  return (
    <div className={styles.matrixSection}>
      <div className={styles.matrixHeader}>
        <div>
          <p className={styles.matrixTitle}>Scoring Matrix</p>
          <p className={styles.matrixDesc}>All weights must total exactly 100%</p>
        </div>
        {options.length > 0 && (
          <span
            className={`${styles.weightBadge} ${
              total === 100
                ? styles.weightOk
                : total > 100
                ? styles.weightOver
                : styles.weightUnder
            }`}
          >
            {total} / 100
          </span>
        )}
      </div>

      {options.length > 0 && (
        <div className={styles.matrixList}>
          {options.map((opt, idx) => (
            <div key={opt.id} className={styles.matrixRow}>
              <span className={styles.rowIndex}>{idx + 1}</span>
              <input
                className={`${styles.input} ${styles.rowLabel}`}
                type="text"
                placeholder="Criteria name"
                value={opt.label}
                onChange={(e) => update(opt.id, "label", e.target.value)}
              />
              <div className={styles.weightWrap}>
                <input
                  className={`${styles.input} ${styles.weightInput}`}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={opt.weight === 0 ? "" : opt.weight}
                  onChange={(e) =>
                    update(
                      opt.id,
                      "weight",
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Math.min(100, Number(e.target.value)))
                    )
                  }
                />
                <span className={styles.pct}>%</span>
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => remove(opt.id)}
                title="Remove criteria"
                type="button"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addRowBtn} onClick={add} type="button">
        <Plus size={13} />
        Add Criteria
      </button>
    </div>
  );
}

// ── Edit row for existing categories ─────────────────────────────────────────

function EditCategoryRow({
  category,
  onSaved,
  onDeleted,
}: {
  category: CategoryLocal;
  onSaved: (updated: CategoryLocal) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [department, setDepartment] = useState(category.department);
  const [matrix, setMatrix] = useState<MatrixOptionLocal[]>(category.matrix);
  const [committeeLead, setCommitteeLead] = useState<CommitteePerson[]>(
    category.committee_lead ? [category.committee_lead] : []
  );
  const [committeeMembers, setCommitteeMembers] = useState<CommitteePerson[]>(
    category.committee_members
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = matrix.reduce((s, o) => s + (o.weight || 0), 0);
  const matrixValid = matrix.length === 0 || total === 100;
  const canSave =
    name.trim() !== "" &&
    department.trim() !== "" &&
    matrixValid &&
    matrix.every((o) => o.label.trim() !== "") &&
    !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCategory(category.id, {
        name: name.trim(),
        department: department.trim(),
        matrix: toApiMatrix(matrix),
        committee_lead: committeeLead[0] ?? null,
        committee_members: committeeMembers,
      });
      onSaved(fromApi(updated));
      setEditing(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to save. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      onDeleted(category.id);
    } catch {
      setDeleting(false);
      setError("Failed to delete. Please try again.");
    }
  };

  const cancel = () => {
    setName(category.name);
    setDepartment(category.department);
    setMatrix(category.matrix);
    setCommitteeLead(category.committee_lead ? [category.committee_lead] : []);
    setCommitteeMembers(category.committee_members);
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className={styles.catRow}>
        <div className={styles.catInfo}>
          <span className={styles.catName}>{category.name}</span>
          {category.department && (
            <span className={styles.deptBadge}>{category.department}</span>
          )}
          {category.matrix.length > 0 && (
            <span className={styles.matrixBadge}>{category.matrix.length} criteria</span>
          )}
          {category.committee_lead && (
            <span className={styles.committeeBadge}>Lead assigned</span>
          )}
          {category.committee_members.length > 0 && (
            <span className={styles.committeeBadge}>
              {category.committee_members.length} member
              {category.committee_members.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className={styles.catActions}>
          <button
            className={styles.editBtn}
            onClick={() => setEditing(true)}
            title="Edit"
            type="button"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => void remove()}
            title="Delete"
            type="button"
            disabled={deleting}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.catEditPanel}>
      <div className={styles.field}>
        <label className={styles.label}>Department</label>
        <input
          className={styles.input}
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g. Human Resources"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category Name</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
      </div>

      <MatrixEditor options={matrix} onChange={setMatrix} />

      {matrix.length > 0 && total !== 100 && (
        <p className={styles.warning}>
          Total weight is {total}%. It must equal exactly 100% to save.
        </p>
      )}

      <div className={styles.committeeSection}>
        <UserSearchPicker
          label="Idea Category Committee Lead"
          selected={committeeLead}
          onChange={setCommitteeLead}
          maxSelections={1}
        />
        <UserSearchPicker
          label="Idea Category Committee Members"
          selected={committeeMembers}
          onChange={setCommitteeMembers}
          maxSelections={5}
        />
      </div>

      {error && <p className={styles.warning}>{error}</p>}

      <div className={styles.editFooter}>
        <button
          className={styles.saveBtn}
          onClick={() => void save()}
          disabled={!canSave}
          type="button"
        >
          <Check size={13} /> {saving ? "Saving…" : "Save"}
        </button>
        <button className={styles.cancelBtn} onClick={cancel} type="button">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

  // Categories list (edit tab)
  const [categories, setCategories] = useState<CategoryLocal[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDepartment, setCategoryDepartment] = useState("");
  const [matrix, setMatrix] = useState<MatrixOptionLocal[]>([newOption()]);
  const [committeeLead, setCommitteeLead] = useState<CommitteePerson[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteePerson[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchCategories = async () => {
    setLoadingCats(true);
    setFetchError(null);
    try {
      const data = await getCategories();
      setCategories(data.map(fromApi));
    } catch {
      setFetchError("Failed to load categories.");
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const total = matrix.reduce((s, o) => s + (o.weight || 0), 0);
  const canSubmit =
    categoryName.trim() !== "" &&
    categoryDepartment.trim() !== "" &&
    matrix.every((o) => o.label.trim() !== "") &&
    total === 100 &&
    !submitting;

  const handleAdd = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createCategory({
        name: categoryName.trim(),
        department: categoryDepartment.trim(),
        matrix: toApiMatrix(matrix),
        committee_lead: committeeLead[0] ?? null,
        committee_members: committeeMembers,
      });
      setCategoryName("");
      setCategoryDepartment("");
      setMatrix([newOption()]);
      setCommitteeLead([]);
      setCommitteeMembers([]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      const data = await getCategories();
      setCategories(data.map(fromApi));
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "Failed to add category. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSubtitle}>Manage idea categories and their scoring matrices</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === "add" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("add")}
            type="button"
          >
            Add Category
          </button>
          <button
            className={`${styles.tab} ${activeTab === "edit" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("edit")}
            type="button"
          >
            Edit Existing Category
          </button>
        </div>

        {/* ── Add Category tab ───────────────────────────────── */}
        {activeTab === "add" && (
          <div className={styles.panel}>
            {submitted && (
              <div className={styles.successBanner}>Category added successfully.</div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Department</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Human Resources"
                value={categoryDepartment}
                onChange={(e) => setCategoryDepartment(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. Cost Optimization"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <MatrixEditor options={matrix} onChange={setMatrix} />

            {total !== 0 && total !== 100 && (
              <p className={styles.warning}>
                Total weight is {total}%. It must equal exactly 100% to submit.
              </p>
            )}

            <div className={styles.committeeSection}>
              <UserSearchPicker
                label="Idea Category Committee Lead"
                selected={committeeLead}
                onChange={setCommitteeLead}
                maxSelections={1}
              />
              <UserSearchPicker
                label="Idea Category Committee Members"
                selected={committeeMembers}
                onChange={setCommitteeMembers}
                maxSelections={5}
              />
            </div>

            {submitError && <p className={styles.warning}>{submitError}</p>}

            <button
              className={styles.submitBtn}
              onClick={() => void handleAdd()}
              disabled={!canSubmit}
              type="button"
            >
              {submitting ? "Adding…" : "Add Category"}
            </button>
          </div>
        )}

        {/* ── Edit Existing Category tab ─────────────────────── */}
        {activeTab === "edit" && (
          <div className={styles.panel}>
            {loadingCats ? (
              <p className={styles.emptyMsg}>Loading categories…</p>
            ) : fetchError ? (
              <div>
                <p className={styles.warning}>{fetchError}</p>
                <button className={styles.addRowBtn} onClick={() => void fetchCategories()} type="button">
                  Retry
                </button>
              </div>
            ) : categories.length === 0 ? (
              <p className={styles.emptyMsg}>No categories yet. Add one first.</p>
            ) : (
              <div className={styles.categoryList}>
                {categories.map((cat) => (
                  <EditCategoryRow
                    key={cat.id}
                    category={cat}
                    onSaved={(updated) =>
                      setCategories((prev) =>
                        prev.map((c) => (c.id === updated.id ? updated : c))
                      )
                    }
                    onDeleted={(id) =>
                      setCategories((prev) => prev.filter((c) => c.id !== id))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
