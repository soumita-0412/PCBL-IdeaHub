"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import styles from "./admin.module.css";

const INITIAL_CATEGORIES = [
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

interface MatrixOption {
  id: string;
  label: string;
  weight: number;
}

interface Category {
  id: string;
  name: string;
  matrix: MatrixOption[];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newOption(): MatrixOption {
  return { id: uid(), label: "", weight: 0 };
}

// ── Shared scoring matrix editor ────────────────────────────────────────────

function MatrixEditor({
  options,
  onChange,
}: {
  options: MatrixOption[];
  onChange: (options: MatrixOption[]) => void;
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

// ── Edit row for existing categories ────────────────────────────────────────

function EditCategoryRow({
  category,
  onSave,
  onDelete,
}: {
  category: Category;
  onSave: (updated: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [matrix, setMatrix] = useState<MatrixOption[]>(category.matrix);

  const total = matrix.reduce((s, o) => s + (o.weight || 0), 0);
  const matrixValid = matrix.length === 0 || total === 100;
  const canSave = name.trim() !== "" && matrixValid && matrix.every((o) => o.label.trim() !== "");

  const save = () => {
    if (!canSave) return;
    onSave({ ...category, name: name.trim(), matrix });
    setEditing(false);
  };

  const cancel = () => {
    setName(category.name);
    setMatrix(category.matrix);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className={styles.catRow}>
        <div className={styles.catInfo}>
          <span className={styles.catName}>{category.name}</span>
          {category.matrix.length > 0 && (
            <span className={styles.matrixBadge}>{category.matrix.length} criteria</span>
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
            onClick={() => onDelete(category.id)}
            title="Delete"
            type="button"
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

      <div className={styles.editFooter}>
        <button
          className={styles.saveBtn}
          onClick={save}
          disabled={!canSave}
          type="button"
        >
          <Check size={13} /> Save
        </button>
        <button className={styles.cancelBtn} onClick={cancel} type="button">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");

  // Add Category form state
  const [categoryName, setCategoryName] = useState("");
  const [matrix, setMatrix] = useState<MatrixOption[]>([newOption()]);
  const [submitted, setSubmitted] = useState(false);

  // All categories (edit tab)
  const [categories, setCategories] = useState<Category[]>(
    INITIAL_CATEGORIES.map((name) => ({ id: uid(), name, matrix: [] }))
  );

  const total = matrix.reduce((s, o) => s + (o.weight || 0), 0);
  const canSubmit =
    categoryName.trim() !== "" &&
    matrix.every((o) => o.label.trim() !== "") &&
    total === 100;

  const handleAdd = () => {
    if (!canSubmit) return;
    setCategories((prev) => [
      ...prev,
      { id: uid(), name: categoryName.trim(), matrix },
    ]);
    setCategoryName("");
    setMatrix([newOption()]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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

        {/* ── Add Category tab ─────────────────────────────────── */}
        {activeTab === "add" && (
          <div className={styles.panel}>
            {submitted && (
              <div className={styles.successBanner}>
                Category added successfully.
              </div>
            )}

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

            <button
              className={styles.submitBtn}
              onClick={handleAdd}
              disabled={!canSubmit}
              type="button"
            >
              Add Category
            </button>
          </div>
        )}

        {/* ── Edit Existing Category tab ────────────────────────── */}
        {activeTab === "edit" && (
          <div className={styles.panel}>
            {categories.length === 0 ? (
              <p className={styles.emptyMsg}>No categories yet. Add one first.</p>
            ) : (
              <div className={styles.categoryList}>
                {categories.map((cat) => (
                  <EditCategoryRow
                    key={cat.id}
                    category={cat}
                    onSave={(updated) =>
                      setCategories((prev) =>
                        prev.map((c) => (c.id === cat.id ? updated : c))
                      )
                    }
                    onDelete={(id) =>
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
