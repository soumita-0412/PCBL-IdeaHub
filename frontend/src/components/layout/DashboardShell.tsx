"use client";

import { useState } from "react";
import { Menu, Lightbulb } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "@/app/(dashboard)/layout.module.css";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {mobileOpen && (
        <div className={styles.backdrop} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={styles.content}>
        <div className={styles.mobileHeader}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div className={styles.mobileBrandWrap}>
            <div className={styles.mobileBrandIcon}>
              <Lightbulb size={16} />
            </div>
            <span className={styles.mobileBrandName}>IdeaPortal</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
