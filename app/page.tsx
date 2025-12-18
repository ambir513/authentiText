import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="text-center space-y-5">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/40">
            Advanced AI Text Detection
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            AuthentiText
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg">
            Accurately distinguish AI-generated from human-written text using a
            conservative ensemble of statistical signals and optional LLM
            verification.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/analysis">
              <Button size="lg" className="font-semibold">
                Open Analyzer
              </Button>
            </Link>
            <Link href="/analysis">
              <Button size="lg" variant="outline">
                Try a sample
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-muted/40 bg-linear-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ensemble Detection</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Blends entropy, repetition, compressibility, and lexical diversity
              with an optional LLM judge to reduce false positives.
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transparent Signals</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              See the specific statistical features and key indicators used in
              each decision for better interpretability.
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Privacy-Friendly</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Local statistical analysis with optional LLM verification. If
              disabled, it still works in stats-only mode.
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 text-center">
          <div className="inline-flex items-center rounded-md bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            Build with ❤️ by Amar, Mandar and Narendra
          </div>
        </section>
      </div>
    </div>
  );
}
