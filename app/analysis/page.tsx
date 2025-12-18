"use client";
import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisChart } from "@/components/analysis-chart";

type Result = {
  label: "Human" | "AI";
  confidence: number;
  reasons: string[];
  features?: Record<string, number> | undefined;
  sources?: {
    stats?: { score: number } | null;
    llm?: { label: "Human" | "AI"; confidence: number } | null;
  };
  error?: string;
};

const samples: { name: string; text: string }[] = [
  {
    name: "Human journal snippet",
    text: "I missed my train again and ended up walking home in the drizzle. The city smelled like wet dust and something vaguely metallic, the way it always does after rain. A guy outside the deli was playing a saxophone badly—still, I tipped him because there's something admirable about trying to create beauty in a place like this, even if the notes don't quite land. Mom called about the basil plant. It's thriving; I'm not. She laughed when I told her that, but I think she understood what I meant. Not that I'm dying or anything dramatic like that. Just tired. The kind of tired that doesn't go away with sleep.",
  },
  {
    name: "AI generic explainer",
    text: "Cloud computing represents a transformative paradigm that fundamentally revolutionizes how organizations access and utilize computational resources in the contemporary digital landscape. This innovative technology enables seamless, on-demand provisioning of a shared pool of configurable computing resources, including networks, servers, storage, applications, and comprehensive services. By leveraging cloud infrastructure, businesses can rapidly deploy and scale their operations with minimal management overhead, thereby optimizing operational efficiency and substantially reducing capital expenditure. The inherent flexibility of cloud computing allows organizations to dynamically allocate resources based on fluctuating demand patterns, ensuring optimal performance",
  },
  {
    name: "Multilingual paragraph (es)",
    text: "La curiosidad no siempre se traduce en respuestas claras y satisfactorias. A veces sólo nos empuja hacia preguntas mejores, más profundas, más desafiantes. Ese, quizá, es el verdadero valor de la búsqueda intelectual: seguir preguntando, incluso cuando el camino no promete claridad definitiva. Los grandes pensadores de la historia entendieron esta verdad fundamental. No vinieron con todas las respuestas; vinieron con preguntas más penetrantes que las generaciones anteriores habían formulado. La ciencia avanza no porque encontramos respuestas finales, sino porque cada respuesta genera nuevas interrogantes. La filosofía progresa del mismo modo.",
  },
];

export default function AnalysisPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const FEATURE_KEYS = useMemo(
    () => [
      "avgSentenceLen",
      "sentenceLenStd",
      "typeTokenRatio",
      "gzipRatio",
      "repetition2",
      "repetition3",
      "sentenceEntropyStd",
      "punctuationRate",
    ],
    []
  );

  const FEATURE_LABELS: Record<string, string> = {
    avgSentenceLen: "Avg sentence length",
    sentenceLenStd: "Sentence length stddev",
    typeTokenRatio: "Type–Token ratio",
    gzipRatio: "Gzip compressibility",
    repetition2: "Bigram repetition",
    repetition3: "Trigram repetition",
    sentenceEntropyStd: "Sentence entropy stddev",
    punctuationRate: "Punctuation rate",
  };

  const canAnalyze = useMemo(
    () => text.trim().length >= 20 && !loading,
    [text, loading]
  );

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to analyze");
      setResult(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function loadSample(t: string) {
    setText(t);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AuthentiText Analyzer
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Advanced AI detection system combining statistical analysis with
            LLM-based verification. Minimize false positives with transparent,
            feature-based explanations.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 px-1">
            Sample Texts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {samples.map((s) => (
              <Button
                key={s.name}
                variant="outline"
                onClick={() => loadSample(s.text)}
                className="h-auto py-2.5 sm:py-3 px-3 sm:px-4 text-left hover:bg-accent/50 hover:border-primary/40 transition-all duration-200 flex flex-col items-start justify-start"
              >
                <div className="space-y-1 sm:space-y-1.5 w-full">
                  <div className="font-semibold text-xs sm:text-sm line-clamp-1 sm:line-clamp-2">
                    {s.name}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {s.text}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Card className="shadow-lg border-muted/40">
          <CardContent className="p-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here for analysis..."
              className="min-h-50 resize-y font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
              <Button
                onClick={analyze}
                disabled={!canAnalyze}
                size="lg"
                className="font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Text"
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Minimum 20 characters required
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-6 shadow-md">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card className="mt-6 shadow-xl border-muted/40 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-muted/30 to-muted/10 border-b">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Card className="border-muted/40">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                        <Skeleton className="h-4 w-9/12" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-muted/40">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-16 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-56 w-56 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !error && (
          <Card className="mt-6 shadow-xl border-muted/40 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-muted/30 to-muted/10 border-b">
              <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-xl">Analysis Result</span>
                <Badge
                  variant={result.label === "AI" ? "destructive" : "default"}
                  className="text-base px-4 py-1.5 font-semibold"
                >
                  {result.label === "AI"
                    ? "🤖 AI-Generated"
                    : "✍️ Human-Written"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  {Array.isArray(result.reasons) &&
                    result.reasons.length > 0 && (
                      <Card className="border-muted/40">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Key Indicators
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {result.reasons.slice(0, 6).map((r, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="text-primary mt-0.5 shrink-0">
                                  •
                                </span>
                                <span className="leading-relaxed">{r}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                  {result.features && (
                    <Card className="border-muted/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Statistical Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Object.entries(result.features)
                            .filter(([k]) => FEATURE_KEYS.includes(k))
                            .map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-muted/30 rounded-lg p-3 space-y-1"
                              >
                                <div
                                  className="text-xs text-muted-foreground font-medium truncate"
                                  title={k}
                                >
                                  {FEATURE_LABELS[k] ?? k}
                                </div>
                                <div className="text-sm font-mono font-semibold">
                                  {typeof v === "number"
                                    ? v.toFixed(3)
                                    : String(v)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <AnalysisChart confidence={result.confidence} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
