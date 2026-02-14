/**
 * Parse SRT (SubRip) caption format and fetch from URL.
 * Used to display caption cues from the API's captions.srt file.
 */

export interface SrtCue {
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

/**
 * Parse SRT time string (00:00:01,500 or 00:00:01.500) to seconds.
 */
function parseSrtTime(timeStr: string): number {
  const normalized = timeStr.trim().replace(/,/, ".");
  const parts = normalized.split(":");
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const secParts = parts[2].split(".");
  const seconds = parseInt(secParts[0], 10) || 0;
  const millis = parseInt(secParts[1], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

/**
 * Parse SRT file content into cue array.
 */
export function parseSrtContent(content: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const timeLine = lines.find((l) => /^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}$/.test(l));
    if (!timeLine) continue;

    const match = timeLine.match(/^(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})$/);
    if (!match) continue;

    const startSeconds = parseSrtTime(match[1]);
    const endSeconds = parseSrtTime(match[2]);
    const textLines = lines.filter((l) => l !== timeLine && !/^\d+$/.test(l));
    const text = textLines.join(" ").trim();

    cues.push({
      index: cues.length + 1,
      startSeconds,
      endSeconds,
      text: text || "(no text)",
    });
  }

  return cues;
}

/**
 * Fetch SRT from URL and parse into cues.
 */
export async function fetchAndParseSrt(url: string): Promise<SrtCue[]> {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(`Failed to fetch SRT: ${res.status}`);
  const text = await res.text();
  return parseSrtContent(text);
}
