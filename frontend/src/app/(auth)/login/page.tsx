"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { env } from "@/constants/env";
import styles from "./login.module.css";

const CAROUSEL_IMAGES = ["/idea1.1.png", "/idea2.1.png", "/idea3.1.png"];

const SSO_AUTHORIZE_URL = `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso/authorize`;

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const onSsoLogin = () => {
    window.location.href = SSO_AUTHORIZE_URL;
  };

  return (
    <div className={styles.page}>

      {/* ── Corner blobs ──────────────────────────────────────── */}
      <div className={styles.blobTopLeft}     aria-hidden="true" />
      <div className={styles.blobBottomLeft}  aria-hidden="true" />
      <div className={styles.blobBottomRight} aria-hidden="true" />

      {/* ── Left panel — form ──────────────────────────────────── */}
      <div className={styles.leftPanel}>
        <div className={styles.formContainer}>

          <h1 className={styles.welcome}>Welcome</h1>
          <p className={styles.subtitle}>Sign in to Idea Hub</p>

          {/* Microsoft SSO */}
          <button
            type="button"
            onClick={onSsoLogin}
            className={styles.msBtn}
          >
            <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#f25022" d="M1 1h9v9H1z" />
              <path fill="#00a4ef" d="M11 1h9v9h-9z" />
              <path fill="#7fba00" d="M1 11h9v9H1z" />
              <path fill="#ffb900" d="M11 11h9v9h-9z" />
            </svg>
            Sign in with Microsoft
          </button>

        </div>
      </div>

      {/* ── Right panel — carousel ─────────────────────────────── */}
      <div className={styles.rightPanel}>
        <div className={styles.carouselCard}>
          <div className={styles.carousel}>
            <div
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_IMAGES.map((src, i) => (
                <div key={i} className={styles.carouselSlide}>
                  <img src={src} alt={`Idea showcase ${i + 1}`} className={styles.carouselImage} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dots}>
            {CAROUSEL_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(styles.dot, i === currentSlide && styles.dotActive)}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative accent corner */}
        <div className={styles.accentCorner} aria-hidden="true" />
      </div>

    </div>
  );
}
