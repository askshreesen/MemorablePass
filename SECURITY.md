# Security Notes & Educational Guide

VaultPhrase is built on the principle of **Zero-Touch Security**. This document explains the technical implementation and best practices for managing your generated passwords.

## 1. Technical Security Implementation

### Cryptographically Secure Randomness
VaultPhrase does **not** use `Math.random()`. All entropy is sourced from `window.crypto.getRandomValues()`, which hooks into the operating system's entropy pool (e.g., `/dev/urandom` on Unix-like systems). This ensures that the generated passwords are highly resistant to prediction.

### Offline-First Architecture
The application is a pure static web app. Once loaded, it does not require an internet connection. 
- **No CDNs:** All logic and styling are bundled locally.
- **No Tracking:** There are no external scripts or trackers.
- **No Cloud Storage:** We do not provide "Save to Cloud" features. You are responsible for your data.

## 2. Password Strength & Entropy

Entropy is measured in **bits**. The more bits of entropy, the harder a password is to brute-force.
- **40-60 bits:** Moderate (Suitable for low-risk accounts).
- **60-80 bits:** Strong (Suitable for primary accounts).
- **80+ bits:** Exceptional (Suitable for master passwords and crypto recovery).

**Recommendation:** For master passwords, use at least 5 words in "Human Readable" mode or 12 words in "Seed Phrase" mode (~128 bits of entropy).

## 3. Storage Best Practices

### Password Managers
Never store your passwords in a `.txt` file on your desktop or in a cloud-synced notes app. Use a reputable password manager:
- **Bitwarden:** Open-source, supports self-hosting.
- **1Password:** Industry standard with strong security audits.
- **KeePassXC:** Fully offline, local database files.

### Physical Backups
For your most important credentials (Master Password, 2FA Recovery Codes, Seed Phrases):
- **Paper:** Use the Print mode in VaultPhrase to create a recovery sheet. Store it in a fireproof/waterproof safe.
- **Steel:** For extreme durability, punch your seed phrases into stainless steel plates.

## 4. Operational Security (OpSec)

- **Clear Clipboard:** VaultPhrase includes a button to empty your clipboard. Modern operating systems also sometimes sync clipboards across devices (e.g., Universal Clipboard on iOS/macOS). Disable this if you are working with sensitive secrets.
- **Clear Browser Cache:** If using a shared computer, clear your browser history/cache or use Incognito mode when generating passwords.
- **Avoid Screenshots:** Never take a digital photo or screenshot of a password. Optical Character Recognition (OCR) in cloud photo services may index your secret.

## 5. Disclaimer

VaultPhrase is provided "as is" without warranty of any kind. While the generation process is cryptographically secure, the ultimate security of your accounts depends on how you store and manage your credentials.
