# AirVent DePIN Release Notes

## Version: v1.6.5 - 2026-03-11

### 🎉 What's New
- **Welcome Toast Notification**: After login, a personalized greeting toast ("OOO님, 환영합니다! 👋") now appears at the top of the page for 4 seconds, confirming successful authentication and enhancing the user experience.
- **Email Sign-Up with Nickname**: Users can now register with email + nickname directly from the login page, with email verification flow.
- **Social Login Onboarding**: Google and X (Twitter) users are redirected to a nickname setup page on first login, ensuring all users have a personalized identity.
- **Global Login Page Refresh**: Removed Naver and Kakao login buttons to align with the global launch strategy. Login now supports Google, X (Twitter), and Email.

### 🛠 Technical Changes
- Version bump to `v1.6.5`.
- New `OnboardingPage.tsx` for first-time social login nickname registration.
- `auth.ts` updated with `signUpWithEmail`, `getNickname`, `saveNickname` helpers.
- `App.tsx` re-routes unauthenticated or no-nickname users appropriately.
- Supabase `profiles` table required for nickname persistence.

---

## Version: v1.6.4 - 2026-03-10

### 🎉 What's New
- **Multilingual Consistency Refinement**: Fixed critical translation errors in the Landing Page. English, Japanese, and Traditional Chinese labels for "Login" and "Dashboard" are now correctly aligned with their respective locales.
- **CTA Alignment (UX Improvement)**: The "Web Demo" CTA on the hero section now correctly directs non-authenticated users to the public demo path (`/judge`) instead of the login page, matching user expectations for a "Demo" experience.

### 🛠 Technical Changes
- Version bump to `v1.6.4`.
- Refactored `LandingPage.tsx` translations for better semantic accuracy.
- Established a roadmap and design for unified i18n management (to be implemented in future phases).

---

## Version: v1.6.1

### 🎉 What's New
- **Kakao Login Terms UI (Demo App)**: Added a premium glassmorphic Terms of Service and Privacy Policy agreement screen to intercept the Kakao signup flow.
- **Privacy & Terms Pages (Website)**: Created static `/privacy` and `/terms` routes in the main dashboard app to fulfill Kakao's business developer requirements. Only Kakao ID and emails are collected.

### 🛠 Technical Changes
- Version bump to `v1.6.1`.
- Safely synced the latest `airvent-demo` source tree with the new changes.


## Version: v1.6.0

### 🎉 What's New
- **App DEMO Prototype Integration**: Introduced a new high-fidelity mobile application prototype (Vite+React based) to showcase the native-like UX of the AirVent Node Network. This includes interactive flows for Login, Node Pairing, IAQ Dashboard, Wallet Integration, and Reward Management.
- **Cross-Navigation**: Added a persistent, elegant "웹사이트로 돌아가기" (Return to Website) floating button within the App DEMO to smoothly navigate back to the main homepage.

### ✨ Main Website Updates
- **Hero Section**: The central "더 알아보기" (Learn More) button on the landing page has been updated to **"앱 DEMO"** and now links directly to the new App DEMO prototype.
- **Top Navigation Bar**: Removed the outdated "대시보드 demo" link for a cleaner header experience.
- **Landing Page Refinements**: Removed the "AirVent Node" and "AirVent Dashboard" informational card sections at the lower part of the landing page to streamline user focus toward the app concept.

### 🛠 Technical Changes
- Version bump to `v1.6.0`.
- Added the `airvent-demo` workspace directory directly into the repository for version control and cohesive updates.
- General refactoring to translation files (`LandingPage.tsx`) for robust i18n support.

## [v1.6.2] - 2026-03-09

### Fixed
- **Naver Social Login**: Fixed a bug where the `VITE_NAVER_CLIENT_ID` was not securely passed from the React frontend to the Edge Function proxy. 
- **Github Actions**: Hardened the `Deploy to Solana Devnet` CI pipeline by downloading the Solana CLI installer explicitly to a file. This ensures the workflow catches and safely aborts on transient SSL download errors instead of silently failing the subsequent Anchor build commands.
- **Frontend Build Issues**: Fixed TypeScript compiler errors (`any` typing) in the `NaverCallbackPage.tsx` component that were causing the Vite development server to freeze and output a blank page.
