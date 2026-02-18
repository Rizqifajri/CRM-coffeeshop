import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed-helper";
import { summarizeInterestTags } from "@/lib/stats";
import { chatWithMimiAssistant } from "@/lib/ai";

const schema = z.object({
  question: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.union([z.literal("user"), z.literal("assistant")]),
        content: z.string().min(1).max(1500),
      }),
    )
    .optional(),
});

export async function POST(req: Request) {
  await ensureSeedData();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  const interestsSummary = summarizeInterestTags(customers);
  const recentCampaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  try {
    const answer = await chatWithMimiAssistant({
      question: parsed.data.question,
      customers: customers.map((c) => ({
        name: c.name,
        contact: c.contact,
        favoriteDrink: c.favoriteDrink,
        interestTags: c.interestTags,
        notes: c.notes,
      })),
      interestsSummary,
      recentCampaigns: recentCampaigns.map((c) => ({
        theme: c.theme,
        segment: c.segment,
        whyNow: c.whyNow,
        message: c.message,
        bestTimeWindow: c.bestTimeWindow,
      })),
      history: parsed.data.history?.slice(-10),
    });
    return NextResponse.json({ answer });
  } catch (e) {
    console.error("Error in /api/chat:", e);
    const message =
      e instanceof Error
        ? e.message
        : "Unknown AI error. Check server logs and environment variables.";

    return NextResponse.json(
      {
        error: `AI error: ${message}`,
      },
      { status: 500 },
    );
  }
}


