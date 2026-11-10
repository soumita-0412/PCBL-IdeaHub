"use client";

import { env } from "@/constants/env";
import styles from "./login.module.css";

const SSO_AUTHORIZE_URL = `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso/authorize`;

export default function LoginPage() {
  const onSsoLogin = () => {
    window.location.href = SSO_AUTHORIZE_URL;
  };

  return (
    <div className={styles.page}>

      <div className={styles.blobTopLeft}    aria-hidden="true" />
      <div className={styles.blobBottomLeft} aria-hidden="true" />

      {/*
        Full-page SVG:
        - Navy fill whose LEFT EDGE is the S-curve
        - Animated dots and stroke travel along that exact same S-curve path
        preserveAspectRatio="none" maps viewBox 0-100 directly to page width/height %.
      */}
      <svg
        className={styles.dividerBg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <path id="dividerPath" d="M50 0 C62 22 38 38 50 50 C62 62 38 78 50 100" />
        </defs>

        {/* Navy fill — right side of the S-curve */}
        <path
          d="M50 0 C62 22 38 38 50 50 C62 62 38 78 50 100 L100 100 L100 0 Z"
          fill="#0f2a6b"
        />

        {/* Stroke along the curve boundary */}
        <use
          href="#dividerPath"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.2"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />

        {/* Static anchor nodes */}
        <circle cx="50" cy="0"   r="0.4" fill="white" opacity="0.4" />
        <circle cx="50" cy="50"  r="0.5" fill="white" opacity="0.5" />
        <circle cx="50" cy="100" r="0.4" fill="white" opacity="0.4" />

        {/* Animated dots flowing along the divider */}
        <circle r="0.5" fill="white" opacity="0.85">
          <animateMotion dur="3.8s" repeatCount="indefinite" begin="0s">
            <mpath href="#dividerPath" />
          </animateMotion>
        </circle>
        <circle r="0.37" fill="white" opacity="0.55">
          <animateMotion dur="3.8s" repeatCount="indefinite" begin="1.27s">
            <mpath href="#dividerPath" />
          </animateMotion>
        </circle>
        <circle r="0.27" fill="white" opacity="0.3">
          <animateMotion dur="3.8s" repeatCount="indefinite" begin="2.53s">
            <mpath href="#dividerPath" />
          </animateMotion>
        </circle>
      </svg>

      {/* Left — Sign in */}
      <div className={styles.leftPanel}>
        <div className={styles.loginBox}>
          <p className={styles.loginWelcome}>Welcome</p>
          <p className={styles.loginSub}>Sign in to continue</p>
          <button type="button" onClick={onSsoLogin} className={styles.msBtn}>
            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#f25022" d="M1 1h9v9H1z" />
              <path fill="#00a4ef" d="M11 1h9v9h-9z" />
              <path fill="#7fba00" d="M1 11h9v9H1z" />
              <path fill="#ffb900" d="M11 11h9v9h-9z" />
            </svg>
            Sign in with Microsoft
          </button>
          <p className={styles.loginHint}>Use your PCBL Microsoft account</p>
        </div>
      </div>

      {/* Right — brand */}
      <div className={styles.rightPanel}>
        <div className={styles.rightBlobTop}    aria-hidden="true" />
        <div className={styles.rightBlobBottom} aria-hidden="true" />
        <div className={styles.brandBox}>
          <h1 className={styles.brandTitle}>IdeaHub</h1>
          <p className={styles.brandTagline}>Where great ideas<br />come to life</p>
          <div className={styles.brandAccent} />
        </div>
      </div>

    </div>
  );
}
