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

      <div className={styles.blobTopLeft}     aria-hidden="true" />
      <div className={styles.blobBottomLeft}  aria-hidden="true" />
      <div className={styles.blobBottomRight} aria-hidden="true" />

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

      {/* Center — flowing S-curve */}
      <div className={styles.centerPanel}>
        <svg
          className={styles.flowSvg}
          viewBox="0 0 100 570"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <path
              id="flowPath"
              d="M50 20 C85 125 15 215 50 295 C85 375 15 465 50 550"
            />
          </defs>

          {/* S-curve track */}
          <use href="#flowPath" stroke="rgba(15,42,107,0.18)" strokeWidth="1.5" />

          {/* Static anchor nodes */}
          <circle cx="50" cy="20"  r="4.5" fill="#0f2a6b" opacity="0.45" />
          <circle cx="50" cy="295" r="5.5" fill="#0f2a6b" opacity="0.55" />
          <circle cx="50" cy="550" r="4.5" fill="#0f2a6b" opacity="0.45" />

          {/* Flowing dots — staggered along the path */}
          <circle r="5.5" fill="#0f2a6b">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="0s">
              <mpath href="#flowPath" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#1c4b98" opacity="0.65">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="1.27s">
              <mpath href="#flowPath" />
            </animateMotion>
          </circle>
          <circle r="2.8" fill="#3b6fd4" opacity="0.4">
            <animateMotion dur="3.8s" repeatCount="indefinite" begin="2.53s">
              <mpath href="#flowPath" />
            </animateMotion>
          </circle>
        </svg>
      </div>

      {/* Right — brand */}
      <div className={styles.rightPanel}>
        <div className={styles.brandBox}>
          <h1 className={styles.brandTitle}>IdeaHub</h1>
          <p className={styles.brandTagline}>Where great ideas<br />come to life</p>
          <div className={styles.brandAccent} />
        </div>
      </div>

    </div>
  );
}
