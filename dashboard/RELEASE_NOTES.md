# Release Notes

## [v1.8.0] - 2026-03-13

### Added
- **Intelligent Language Detection**: Restored automatic browser language detection (KO, EN, JA, ZH-TW) while maintaining English as the smart fallback for unsupported languages.
- **Multi-Domain Language Persistence**: Enhanced redirection logic to preserve language parameters across different deployment domains (airvent.ai, vercel.app, etc.).
- **Global Auth Redirection Sync**: Ensured seamless language transition during all authentication events and automatic redirections.
- **Localized UI Feedback**: Fully localized the welcome toast messages and removed remaining hardcoded Korean snippets in the login and landing pages.

### Fixed
- **OAuth Parameter Loss**: Resolved an issue where social logins (Google, X) would occasionally lose the selected language state post-authentication.
- **Cross-Domain "Domain Jumps"**: Fixed a bug where redirections between authorized domains would reset the interface to Korean.
- **Initial Load Reset**: Eliminated the flicker/reset to default language during the initial mount of the Landing Page.

---

## [v1.6.6] - 2026-03-12

### Added
- **Multilingual Policy Support**: Fully localized Privacy Policy, Terms of Service, and Warranty Policy pages.
- **Support for 4 Languages**: Added professional translations for English (EN), Japanese (JA), and Traditional Chinese (ZH-TW), alongside existing Korean (KO).
- **Dynamic Language Switching**: Policy content now synchronizes automatically with the global language selector on the Landing Page.
- **Warranty, Refund & Shipping Policy**: Implemented a new comprehensive policy page with dark theme styling.

### Fixed
- **UI Consistency**: Standardized typography, dark theme colors, and layout across all legal pages.
- **Localization Bug**: Fixed issue where policy pages were hardcoded to Korean regardless of user selection.
- **Build Stability**: Resolved minor translation key typos causing build failures in previous iterations.

---

## [v1.6.3] - 2026-03-10
### Added
- Initial multilingual support for Japanese (JA) and Traditional Chinese (ZH-TW) on the Landing Page.
- Polite terminology for JA translations.

## [v1.5.0] - 2026-03-07
### Added
- Basic dashboard functionality with Korean and English support.
