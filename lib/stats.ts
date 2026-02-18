import type { Customer } from "@prisma/client";

export function normalizeTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

export function summarizeInterestTags(customers: Pick<Customer, "interestTags">[]) {
  const counts = new Map<string, number>();
  for (const c of customers) {
    for (const raw of c.interestTags || []) {
      const t = normalizeTag(raw);
      if (!t) continue;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function fallbackPromoIdeas(summary: { tag: string; count: number }[]) {
  const top = summary.slice(0, 6);
  const pick = (keyword: string) =>
    top.find((t) => t.tag.includes(keyword))?.count ?? 0;

  const sweetCount = pick("sweet");
  const caramelCount = pick("caramel");
  const oatCount = pick("oat");
  const pastryCount = pick("pastry");
  const workshopCount = pick("workshop") + pick("latte art");
  const morningCount = pick("morning");
  const icedCount = pick("iced") + pick("cold");

  const ideas = [
    {
      theme: caramelCount || sweetCount ? "Caramel Series Week" : "Signature Menu Week",
      segment: `Target: pecinta ${caramelCount ? "caramel & sweet drinks" : "menu signature"} (berdasarkan tag populer).`,
      whyNow: "Interest terbanyak minggu ini mengarah ke rasa manis/caramel & minuman dingin.",
      message:
        "Hi! Minggu ini ada Caramel Series di Kopi Kita — cobain menu caramel favorit kamu. Reply 'CARAMEL' ya, nanti aku kirim rekomendasi + promo ringan sampai Minggu!",
      bestTimeWindow: icedCount ? "siang–sore" : "kapan saja",
    },
    {
      theme: pastryCount ? "Pastry + Coffee Bundle" : "Morning Rush Bundle",
      segment: `Target: ${pastryCount ? "pastry lovers" : "morning buyers"} + coffee drinkers.`,
      whyNow: "Paket bundling cocok untuk meningkatkan repeat order di jam ramai.",
      message:
        "Pagi ini ada bundle kopi + pastry biar lebih hemat. Mau aku siapin untuk jam 7–11? Reply 'BUNDLE' ya!",
      bestTimeWindow: morningCount ? "weekday mornings (07.00–11.00)" : "weekday mornings",
    },
  ];

  if (oatCount) {
    ideas.push({
      theme: "Oat Milk Lovers Perk",
      segment: "Target: fans oat milk & non-dairy.",
      whyNow: "Minat non-dairy/oat milk lagi tinggi — pas untuk highlight menu lebih ringan.",
      message:
        "Lagi pengen yang ringan? Oat latte & oat spanish latte lagi jadi favorit. Reply 'OAT' ya, aku kasih rekomendasi + promo kecil weekend ini!",
      bestTimeWindow: "weekend afternoons",
    });
  } else if (workshopCount) {
    ideas.push({
      theme: "Latte Art Mini Class",
      segment: "Target: customers dengan minat workshop/latte art.",
      whyNow: "Ada minat konsisten untuk kelas — bagus untuk upsell experience.",
      message:
        "Mau ikut Latte Art Mini Class minggu ini? Slot terbatas. Reply 'CLASS' ya biar aku kirim jadwal + reservasi.",
      bestTimeWindow: "weekend mornings",
    });
  }

  return ideas.slice(0, 3);
}


