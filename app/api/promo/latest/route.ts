import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed-helper";
import { summarizeInterestTags } from "@/lib/stats";

export async function GET() {
  await ensureSeedData();
  const [customers, campaigns] = await Promise.all([
    prisma.customer.findMany(),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const interestsSummary = summarizeInterestTags(customers);
  return NextResponse.json({ campaigns, interestsSummary });
}


