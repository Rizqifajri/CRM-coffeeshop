"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Campaign = {
  id: string;
  theme: string;
  segment: string;
  whyNow: string;
  message: string;
  bestTimeWindow: string | null;
  createdAt: string;
};

type Summary = { tag: string; count: number };

async function fetchLatest() {
  const res = await fetch("/api/promo/latest");
  if (!res.ok) throw new Error("Failed to fetch promo data");
  return (await res.json()) as { campaigns: Campaign[]; interestsSummary: Summary[] };
}

async function generate() {
  const res = await fetch("/api/promo/generate", { method: "POST" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to generate promos");
  }
  return (await res.json()) as { ideas: Campaign[]; interestsSummary: Summary[] };
}

function copyToClipboard(text: string) {
  void navigator.clipboard?.writeText(text);
}

export function PromoClient() {
  const [copied, setCopied] = useState<string | null>(null);

  const latestQuery = useQuery({
    queryKey: ["promo-latest"],
    queryFn: fetchLatest,
  });

  const genMutation = useMutation({
    mutationFn: generate,
    onSuccess: async () => {
      await latestQuery.refetch();
    },
  });

  const campaigns = latestQuery.data?.campaigns?.slice(0, 3) || [];
  const summary = latestQuery.data?.interestsSummary || [];

  const topTags = useMemo(() => summary.slice(0, 10), [summary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">Interest trends (top tags)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {topTags.length ? (
              topTags.map((t) => (
                <Badge key={t.tag} variant="outline">
                  {t.tag} · {t.count}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => genMutation.mutate()} disabled={genMutation.isPending}>
            {genMutation.isPending ? "Generating..." : "Generate promo ideas"}
          </Button>
        </div>
      </div>

      {genMutation.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {(genMutation.error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-border/70 bg-white/60 p-4 dark:bg-zinc-950/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{c.theme}</div>
              {c.bestTimeWindow ? <Badge variant="outline">{c.bestTimeWindow}</Badge> : null}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{c.segment}</div>
            <div className="mt-3 text-sm">
              <span className="font-medium">Why now:</span>{" "}
              <span className="text-muted-foreground">{c.whyNow}</span>
            </div>
            <div className="mt-3 rounded-xl border border-border/70 bg-white/70 p-3 text-sm dark:bg-zinc-900/40">
              {c.message}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  copyToClipboard(c.message);
                  setCopied(c.id);
                  setTimeout(() => setCopied(null), 1200);
                }}
              >
                {copied === c.id ? "Copied" : "Copy message"}
              </Button>
            </div>
          </div>
        ))}

        {!latestQuery.isLoading && campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground md:col-span-3">
            Belum ada promo ideas tersimpan. Klik <b>Generate promo ideas</b> untuk buat campaign minggu ini.
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        AI menggunakan prompt di folder <code className="font-mono">ai/</code>. Jika API key AI belum diset, sistem akan pakai fallback heuristic berbasis counts.
      </p>
    </div>
  );
}


