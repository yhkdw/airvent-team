# AirVent DePIN Release Notes

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
