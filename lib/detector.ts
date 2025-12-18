import { createGzip } from "node:zlib";
import { Readable } from "node:stream";

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  const cleaned = text.replace(/([.!?])([^\s])/g, "$1 $2");
  return cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function wordTokens(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/[\u2019']/g, "'")
      .match(/[\p{L}\p{N}']+/gu)
      ?.filter(Boolean) ?? []
  );
}

// Minimal multilingual-ish stopword list (bias to common English/function words)
const STOPWORDS = new Set([
  "the",
  "is",
  "in",
  "at",
  "of",
  "on",
  "and",
  "a",
  "to",
  "for",
  "with",
  "as",
  "by",
  "that",
  "this",
  "it",
  "be",
  "or",
  "are",
  "was",
  "were",
  "from",
  "an",
  "but",
  "not",
  "have",
  "has",
  "had",
  "can",
  "could",
  "will",
  "would",
  "should",
  "we",
  "you",
  "they",
  "he",
  "she",
  "i",
  "me",
  "my",
  "our",
  "your",
  "their",
  "them",
  "his",
  "her",
  "its",
  "if",
  "then",
  "than",
  "so",
  "also",
  "about",
  "into",
  "over",
  "after",
  "before",
  "because",
  "while",
  "when",
  "where",
  "which",
  "who",
  "whom",
  "what",
  "how",
  "why",
  // Spanish/French/German common
  "de",
  "la",
  "el",
  "y",
  "en",
  "que",
  "un",
  "una",
  "los",
  "las",
  "del",
  "se",
  "por",
  "con",
  "para",
  "les",
  "des",
  "du",
  "et",
  "le",
  "la",
  "ein",
  "eine",
  "und",
  "der",
  "die",
  "das",
  "ist",
  "zu",
  "den",
  "dem",
  "auf",
  "im",
  "nicht",
  "ich",
]);

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): { variance: number; std: number } {
  if (arr.length <= 1) return { variance: 0, std: 0 };
  const m = mean(arr);
  const v = mean(arr.map((x) => (x - m) ** 2));
  return { variance: v, std: Math.sqrt(v) };
}

function shannonEntropy(str: string): number {
  if (!str) return 0;
  const freq = new Map<string, number>();
  for (const ch of str) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  const n = str.length;
  let H = 0;
  for (const c of freq.values()) {
    const p = c / n;
    H -= p * Math.log2(p);
  }
  return H; // bits per character
}

async function gzipCompressibilityRatio(text: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const src = Readable.from([Buffer.from(text, "utf8")]);
    const gzip = createGzip();
    const chunks: Buffer[] = [];
    gzip.on("data", (c) => chunks.push(c as Buffer));
    gzip.on("end", () => {
      const compressed = Buffer.concat(chunks);
      resolve(compressed.length / Math.max(1, Buffer.byteLength(text, "utf8")));
    });
    gzip.on("error", reject);
    src.pipe(gzip);
  });
}

function ngramRepetition(tokens: string[], n: number): number {
  if (tokens.length < n) return 0;
  const counts = new Map<string, number>();
  for (let i = 0; i <= tokens.length - n; i++) {
    const key = tokens.slice(i, i + n).join("\u0001");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let max = 0;
  for (const v of counts.values()) max = Math.max(max, v);
  return max / Math.max(1, tokens.length - n + 1);
}

export type StatFeatures = {
  length: number;
  sentences: number;
  avgSentenceLen: number;
  sentenceLenStd: number;
  paragraphs: number;
  paragraphLenStd: number;
  typeTokenRatio: number;
  functionWordRatio: number;
  punctuationRate: number;
  uppercaseRate: number;
  digitRate: number;
  charEntropy: number;
  sentenceEntropyStd: number;
  gzipRatio: number; // compressed/original
  repetition1: number;
  repetition2: number;
  repetition3: number;
};

export async function computeStatFeatures(
  textRaw: string
): Promise<StatFeatures> {
  const text = normalizeWhitespace(textRaw);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const tokens = wordTokens(text);
  const tokenSet = new Set(tokens);

  const sentenceLens = sentences.map((s) => wordTokens(s).length);
  const { std: sentenceLenStd } = variance(sentenceLens);

  const paragraphLens = paragraphs.map((p) => wordTokens(p).length);
  const { std: paragraphLenStd } = variance(paragraphLens);

  const typeTokenRatio = tokens.length ? tokenSet.size / tokens.length : 0;
  const functionWordCount = tokens.filter((t) => STOPWORDS.has(t)).length;
  const functionWordRatio = tokens.length
    ? functionWordCount / tokens.length
    : 0;

  const punctMatches = text.match(/[\p{P}]/gu) ?? [];
  const punctuationRate = text.length ? punctMatches.length / text.length : 0;
  const upperMatches = text.match(/[A-ZÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑÇ]/g) ?? [];
  const uppercaseRate = text.length ? upperMatches.length / text.length : 0;
  const digitMatches = text.match(/[0-9]/g) ?? [];
  const digitRate = text.length ? digitMatches.length / text.length : 0;

  const charEntropy = shannonEntropy(text);
  const sentenceEntropyStd = variance(
    sentences.map((s) => shannonEntropy(s))
  ).std;

  const gzipRatio = await gzipCompressibilityRatio(text);

  const repetition1 = ngramRepetition(tokens, 1);
  const repetition2 = ngramRepetition(tokens, 2);
  const repetition3 = ngramRepetition(tokens, 3);

  return {
    length: text.length,
    sentences: sentences.length,
    avgSentenceLen: mean(sentenceLens) || 0,
    sentenceLenStd: sentenceLenStd || 0,
    paragraphs: paragraphs.length,
    paragraphLenStd: paragraphLenStd || 0,
    typeTokenRatio,
    functionWordRatio,
    punctuationRate,
    uppercaseRate,
    digitRate,
    charEntropy,
    sentenceEntropyStd,
    gzipRatio,
    repetition1,
    repetition2,
    repetition3,
  };
}

export type StatAssessment = {
  score: number; // 0..1 AI-likelihood
  label: "Human" | "AI";
  reasons: string[];
};

export function assessStats(feat: StatFeatures): StatAssessment {
  const f = feat;
  // Heuristic scoring (bounded 0..1). Tuned to be conservative.
  const sLowVariance =
    1 - Math.tanh((f.sentenceLenStd / (f.avgSentenceLen + 1e-6)) * 1.2);
  const sLowTTR = 1 - Math.min(1, f.typeTokenRatio * 2.0);
  const sHighGzip = Math.min(1, (f.gzipRatio - 0.15) / 0.35); // >0.5 often more repetitive
  const sRepetition = Math.min(1, f.repetition2 * 4 + f.repetition3 * 6);
  const sLowEntropyVar = 1 - Math.min(1, f.sentenceEntropyStd / 1.2);
  const sPunctReg = Math.max(0, 0.4 - Math.abs(f.punctuationRate - 0.07)) / 0.4; // pushes up if very regular

  // Weighted sum
  let raw =
    0.24 * sLowVariance +
    0.22 * sLowTTR +
    0.2 * sHighGzip +
    0.18 * sRepetition +
    0.1 * sLowEntropyVar +
    0.06 * sPunctReg;

  // Confidence penalties for short/low-signal texts
  const penalty = Math.max(0, 1 - Math.min(1, f.length / 600)) * 0.25;
  raw = Math.max(0, Math.min(1, raw - penalty));

  const label: "Human" | "AI" = raw > 0.6 ? "AI" : "Human";

  const reasons: string[] = [];
  if (sLowVariance > 0.6)
    reasons.push(
      "Low sentence-length variability suggests machine-regular pacing"
    );
  if (sLowTTR > 0.6)
    reasons.push("Limited lexical diversity relative to length");
  if (sHighGzip > 0.6)
    reasons.push(
      "High compressibility indicates repetition and formulaic phrasing"
    );
  if (sRepetition > 0.5)
    reasons.push("Repeated n-grams beyond typical human usage");
  if (sLowEntropyVar > 0.6)
    reasons.push("Uniform character-level entropy across sentences");
  if (reasons.length === 0)
    reasons.push("Statistical signals favor human-like variability");

  return { score: raw, label, reasons };
}
