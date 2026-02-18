import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed-helper";
import { summarizeInterestTags, fallbackPromoIdeas } from "@/lib/stats";
import { generateGlobalPromosFromData } from "@/lib/ai";

export async function POST() {
  await ensureSeedData();
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  const interestsSummary = summarizeInterestTags(customers);

  let ideas:
    | {
        theme: string;
        segment: string;
        whyNow: string;
        message: string;
        bestTimeWindow?: string;
      }[]
    | null = null;

  try {
    ideas = await generateGlobalPromosFromData({
      customers: customers.map((c) => ({
        name: c.name,
        contact: c.contact,
        favoriteDrink: c.favoriteDrink,
        interestTags: c.interestTags,
        notes: c.notes,
      })),
      interestsSummary,
    });
  } catch {
    ideas = fallbackPromoIdeas(interestsSummary);
  }

  // Save latest ideas (append-only)
  const created = await Promise.all(
    ideas.slice(0, 3).map((i) =>
      prisma.campaign.create({
        data: {
          theme: i.theme,
          segment: i.segment,
          whyNow: i.whyNow,
          message: i.message,
          bestTimeWindow: i.bestTimeWindow || null,
        },
      }),
    ),
  );

  return NextResponse.json({ ideas: created, interestsSummary });
}


