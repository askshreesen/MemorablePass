# VaultPhrase

VaultPhrase is a fully offline-first, privacy-focused password and seed phrase generator. It is designed to work entirely in your browser without any network connection, ensuring your generated passwords never leave your machine.

Inspired by cryptocurrency BIP39 seed phrase generators, VaultPhrase produces human-readable but mathematically strong passwords using a curated high-entropy wordlist.

## Core Features

- **Human-Readable Passwords:** Generates easy-to-remember passphrases like `Falcon-River-82-Mango`.
- **Crypto Seed Style:** Generate recovery-style phrases optimized for physical backups.
- **Offline-Only Architecture:** No analytics, no tracking, no API calls. Works 100% offline.
- **Secure Randomness:** Uses the `Web Crypto API` (crypto.getRandomValues) for cryptographically secure pseudo-random number generation (CSPRNG).
- **Security Tools:** Built-in entropy calculator, auto-clear clipboard timer, and strength meter.
- **Export Options:** Download as `.txt`, `.json` (backup), or generate a print-friendly recovery sheet.
- **Customizable:** Configure word count, separators, capitalization, and character sets.

## Technical Requirements

- Modern browser with Web Crypto API support.
- No backend required (Static SPA).
- No internet connection required after initial load.

## Security Proof

- **Zero Telemetry:** No Google Analytics, no tracking pixels, no external scripts.
- **Zero Networking:** The application makes zero `fetch` or `XHR` calls.
- **Local Generation:** Entropy is generated in the browser's execution context and is never stored in persistent browser storage unless explicitly exported by the user.

## How to Use

1. Choose your preferred generation mode (Human Readable, Seed Phrase, etc.).
2. Adjust the word count or length to match your security requirements.
3. Click **Regenerate** to find a passphrase you like.
4. Click **Copy** to use it, or **Print** to create a physical backup.
5. Use the **Security Guide** tab to learn more about protecting your secrets.

---
**VaultPhrase: Your secrets remain yours.**
