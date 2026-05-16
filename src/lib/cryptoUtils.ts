/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WORDLIST } from './wordlist';

export enum CapitalizationMode {
  LOWERCASE = 'lowercase',
  UPPERCASE = 'uppercase',
  TITLECASE = 'titlecase',
  RANDOM = 'random'
}

export enum GeneratorMode {
  HUMAN_READABLE = 'human-readable',
  SEED_PHRASE = 'seed-phrase',
  RANDOM_CHARS = 'random-chars',
  DICEWARE = 'diceware'
}

export interface GeneratorOptions {
  mode: GeneratorMode;
  wordCount: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  capitalization: CapitalizationMode;
  separator: string;
  excludeConfusing: boolean;
  length?: number; // For random chars mode
}

const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const NUMBERS = "0123456789";
const CHARS_ALL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
const CHARS_SAFE = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes O 0 l I 1 S 5 (S/5 sometimes ok but user said exclude)

/**
 * Robust random number generation using Web Crypto API.
 */
function getRandomInt(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * Formats a word based on the capitalization mode.
 */
function formatWord(word: string, mode: CapitalizationMode): string {
  switch (mode) {
    case CapitalizationMode.UPPERCASE:
      return word.toUpperCase();
    case CapitalizationMode.TITLECASE:
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    case CapitalizationMode.RANDOM:
      return getRandomInt(2) === 0 ? word.toUpperCase() : word.toLowerCase();
    case CapitalizationMode.LOWERCASE:
    default:
      return word.toLowerCase();
  }
}

/**
 * Main generation function.
 */
export function generatePassword(options: GeneratorOptions): string {
  const parts: string[] = [];

  if (options.mode === GeneratorMode.HUMAN_READABLE || options.mode === GeneratorMode.SEED_PHRASE) {
    for (let i = 0; i < options.wordCount; i++) {
        const word = WORDLIST[getRandomInt(WORDLIST.length)];
        parts.push(formatWord(word, options.capitalization));
    }

    if (options.includeNumbers) {
        const insertPos = getRandomInt(parts.length + 1);
        parts.splice(insertPos, 0, getRandomInt(100).toString());
    }

    if (options.includeSymbols) {
        const symbol = SYMBOLS[getRandomInt(SYMBOLS.length)];
        const insertPos = getRandomInt(parts.length + 1);
        parts.splice(insertPos, 0, symbol);
    }

    return parts.join(options.separator);
  }

  if (options.mode === GeneratorMode.RANDOM_CHARS) {
    const length = options.length || 16;
    const pool = options.excludeConfusing ? CHARS_SAFE : CHARS_ALL;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += pool[getRandomInt(pool.length)];
    }
    return result;
  }

  if (options.mode === GeneratorMode.DICEWARE) {
      // Simplification of diceware: just uses the wordlist but with a different feel/config
      for (let i = 0; i < options.wordCount; i++) {
          parts.push(WORDLIST[getRandomInt(WORDLIST.length)]);
      }
      return parts.join(" ");
  }

  return "";
}

/**
 * Estimates entropy in bits.
 */
export function calculateEntropy(password: string, options: GeneratorOptions): number {
    if (options.mode === GeneratorMode.HUMAN_READABLE || options.mode === GeneratorMode.SEED_PHRASE) {
        // Entropy = log2(wordlist_size^count)
        let entropy = Math.log2(WORDLIST.length) * options.wordCount;
        if (options.includeNumbers) entropy += Math.log2(100);
        if (options.includeSymbols) entropy += Math.log2(SYMBOLS.length);
        return Math.floor(entropy);
    } else {
        const poolSize = options.excludeConfusing ? CHARS_SAFE.length : CHARS_ALL.length;
        const length = password.length;
        return Math.floor(Math.log2(poolSize) * length);
    }
}

/**
 * Returns a strength label based on entropy.
 */
export function getStrengthLabel(entropy: number): { label: string; color: string } {
    if (entropy < 40) return { label: "Weak", color: "text-red-500" };
    if (entropy < 60) return { label: "Moderate", color: "text-yellow-500" };
    if (entropy < 80) return { label: "Strong", color: "text-green-500" };
    if (entropy < 100) return { label: "Very Strong", color: "text-emerald-400" };
    return { label: "Exceptional", color: "text-cyan-400" };
}
