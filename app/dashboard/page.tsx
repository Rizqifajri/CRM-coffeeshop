import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed-helper";
import { summarizeInterestTags } from "@/lib/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureSeedData();

  const [customers, campaigns] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const summary = summarizeInterestTags(customers);
  const top = summary.slice(0, 8);

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Ringkasan cepat minggu ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total customers</span>
            <span className="text-2xl font-semibold">{customers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {top.length ? (
              top.map((t) => (
                <Badge key={t.tag} variant="outline">
                  {t.tag} · {t.count}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada interest tags.
              </p>
            )}
          </div>
          <div className="pt-2">
            <Link className="text-sm font-medium text-emerald-700 hover:underline" href="/customers">
              Kelola customer →
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Suggested campaigns</CardTitle>
          <CardDescription>
            Diambil dari halaman <b>Promo Ideas</b> (generate terbaru)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaigns.length ? (
            campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/70 bg-white/60 p-4 dark:bg-zinc-950/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{c.theme}</div>
                  {c.bestTimeWindow ? (
                    <Badge variant="outline">{c.bestTimeWindow}</Badge>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{c.segment}</div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Why now:</span>{" "}
                  <span className="text-muted-foreground">{c.whyNow}</span>
                </div>
                <div className="mt-3 rounded-lg border border-border/70 bg-white/70 p-3 text-sm dark:bg-zinc-900/40">
                  {c.message}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 p-6">
              <p className="text-sm text-muted-foreground">
                Belum ada campaign tersimpan. Generate dulu di{" "}
                <Link href="/promo" className="font-medium text-emerald-700 hover:underline">
                  Promo Ideas
                </Link>
                .
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


