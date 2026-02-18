import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed-helper";
import { normalizeTag } from "@/lib/stats";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  contact: z.string().max(120).optional().nullable(),
  favoriteDrink: z.string().max(120).optional().nullable(),
  interestTags: z.array(z.string()).max(20).default([]),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  await ensureSeedData();

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const tag = (url.searchParams.get("tag") || "").trim().toLowerCase();

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = customers.filter((c) => {
    const matchesQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.favoriteDrink || "").toLowerCase().includes(q) ||
      (c.notes || "").toLowerCase().includes(q) ||
      (c.interestTags || []).some((t) => t.toLowerCase().includes(q));

    const matchesTag = !tag || (c.interestTags || []).some((t) => t.toLowerCase() === tag);
    return matchesQ && matchesTag;
  });

  return NextResponse.json({ customers: filtered });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const interestTags = (data.interestTags || [])
    .map(normalizeTag)
    .filter(Boolean);

  const created = await prisma.customer.create({
    data: {
      name: data.name.trim(),
      contact: data.contact?.trim() || null,
      favoriteDrink: data.favoriteDrink?.trim() || null,
      interestTags,
      notes: data.notes?.trim() || null,
    },
  });

  return NextResponse.json({ customer: created }, { status: 201 });
}


