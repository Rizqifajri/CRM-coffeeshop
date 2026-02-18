import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeTag } from "@/lib/stats";

const updateSchema = z.object({
  name: z.string().min(1).max(80),
  contact: z.string().max(120).optional().nullable(),
  favoriteDrink: z.string().max(120).optional().nullable(),
  interestTags: z.array(z.string()).max(20).default([]),
  notes: z.string().max(500).optional().nullable(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const interestTags = (data.interestTags || [])
    .map(normalizeTag)
    .filter(Boolean);

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name.trim(),
      contact: data.contact?.trim() || null,
      favoriteDrink: data.favoriteDrink?.trim() || null,
      interestTags,
      notes: data.notes?.trim() || null,
    },
  });

  return NextResponse.json({ customer: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


