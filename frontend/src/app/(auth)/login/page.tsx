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
          <div className={styles.brandHeading}>
            {/* Premium winking bulb mascot */}
            <svg width="44" height="49" viewBox="0 0 56 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="bgFill" cx="42%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFCE0" />
                  <stop offset="55%" stopColor="#FFE04A" />
                  <stop offset="100%" stopColor="#EFA000" />
                </radialGradient>
                <radialGradient id="glowLum" cx="50%" cy="62%" r="55%">
                  <stop offset="0%" stopColor="#FFFACC" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </radialGradient>
<linearGradient id="capMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7A6030" />
                  <stop offset="50%" stopColor="#C0A048" />
                  <stop offset="100%" stopColor="#7A6030" />
                </linearGradient>
              </defs>
              {/* Outer warm corona */}
              <ellipse cx="28" cy="24" rx="26" ry="25" fill="#FFD700" fillOpacity="0.10" />
              <ellipse cx="28" cy="24" rx="20" ry="19" fill="#FFE566" fillOpacity="0.09" />
              {/* Main glass body */}
              <path
                d="M28 4 C17 4 9 12 9 23 C9 33 15 39 19 43 L19 47 L37 47 L37 43 C41 39 47 33 47 23 C47 12 39 4 28 4Z"
                fill="url(#bgFill)" stroke="#C08800" strokeWidth="1.2" strokeLinejoin="round"
              />
              {/* Inner luminosity from filament area */}
              <ellipse cx="28" cy="37" rx="12" ry="10" fill="url(#glowLum)" />
              {/* Ambient face-area light */}
              <ellipse cx="28" cy="21" rx="15" ry="14" fill="#FFFBE8" fillOpacity="0.28" />
              {/* Filament — elegant double arch */}
              <path d="M21 44 L21 37 C21 31.5 24.5 29.5 27 32.5 C29.5 35.5 29 39 29 44" stroke="#FF7200" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M29 44 L29 37 C29 31.5 32.5 29.5 35 32.5 C37.5 35.5 37 39 37 44" stroke="#FF7200" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              {/* Filament inner glow highlight */}
              <path d="M21 44 L21 37 C21 31.5 24.5 29.5 27 32.5 C29.5 35.5 29 39 29 44" stroke="#FFDD60" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.65" />
              <path d="M29 44 L29 37 C29 31.5 32.5 29.5 35 32.5 C37.5 35.5 37 39 37 44" stroke="#FFDD60" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.65" />
              {/* Base cap — metallic screw */}
              <rect x="19" y="47" width="18" height="3.5" rx="0.5" fill="url(#capMetal)" stroke="#907030" strokeWidth="0.8" />
              <rect x="20.5" y="50.5" width="15" height="3" rx="0.5" fill="url(#capMetal)" stroke="#907030" strokeWidth="0.8" />
              <rect x="22" y="53.5" width="12" height="4.5" rx="2.2" fill="#786028" stroke="#5C4010" strokeWidth="0.8" />
              {/* Glass highlights */}
              <ellipse cx="14.5" cy="12" rx="2.2" ry="4.2" fill="white" fillOpacity="0.34" transform="rotate(-22 14.5 12)" />
              <ellipse cx="19.5" cy="7.5" rx="1" ry="1.8" fill="white" fillOpacity="0.2" transform="rotate(-14 19.5 7.5)" />
            </svg>
            <div className={styles.brandText}>
              <h1 className={styles.brandTitle}>IdeaHub</h1>
              <p className={styles.brandTagline}>Where great ideas<br />come to life</p>
              <div className={styles.brandAccent} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
