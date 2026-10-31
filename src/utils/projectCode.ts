/**
 * Computes a standardized project code from a project title.
 * Formed from initials of each word:
 * - If project name has 3 words: e.g. "Cloudflare Edge Engine" -> "CEE"
 * - If 3 words: "omnia ai vision" -> "OAV"
 * - If 3 words: "Zero Trust Auth" -> "ZTA"
 * - If 3 words: "Real Time Metrics" -> "RTM"
 * - If 3 words: "DevLog Mobile Web" -> "DMW"
 * - Handles punctuation, hyphens, and ignores minor connector words ("and", "&", "of", etc.)
 * - Single word: first 3 characters capitalized, e.g. "DevLog" -> "DEV"
 */
export function getProjectCode(title?: string | null): string {
  if (!title || !title.trim()) return 'PRJ';

  // Strip version suffixes like v1, v2.0, v3.1.2
  const cleaned = title.replace(/\bv\d+(\.\d+)*\b/gi, '').trim();

  // Split on whitespace, hyphens, slashes, underscores
  const words = cleaned
    .split(/[\s\-_/]+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, '').trim())
    .filter((w) => w.length > 0 && !/^(&|and|the|of|for|in|on|at|to)$/i.test(w));

  if (words.length === 0) {
    const rawClean = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return rawClean.slice(0, 3) || 'PRJ';
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  // Multi-word: take the initial letter of each word (up to 5 chars)
  return words
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 5);
}

/**
 * Returns human-facing task identifier, e.g. "CEE-1", "OAV-2", "ZTA-3".
 * Prefers explicitly persisted taskKey, with robust fallback to projectCode + taskNumber or id slice.
 */
export function formatTaskKey(
  taskKey?: string | null,
  projectTitleOrCode?: string | null,
  taskNumber?: number | null,
  fallbackId?: string
): string {
  if (taskKey && taskKey.trim()) {
    return taskKey.trim();
  }

  const code = projectTitleOrCode
    ? /^[A-Z0-9]{2,6}$/.test(projectTitleOrCode.trim())
      ? projectTitleOrCode.trim()
      : getProjectCode(projectTitleOrCode)
    : 'TSK';

  if (typeof taskNumber === 'number' && taskNumber > 0) {
    return `${code}-${taskNumber}`;
  }

  if (fallbackId) {
    return `${code}-${fallbackId.slice(0, 4).toUpperCase()}`;
  }

  return `${code}-1`;
}
