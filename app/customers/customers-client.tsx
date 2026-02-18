"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { normalizeTag } from "@/lib/stats";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  favoriteDrink: string | null;
  interestTags: string[] | null | undefined;
  notes: string | null;
  createdAt: string;
};

async function fetchCustomers(q: string, tag: string) {
  const url = new URL("/api/customers", window.location.origin);
  if (q) url.searchParams.set("q", q);
  if (tag) url.searchParams.set("tag", tag);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch customers");
  return (await res.json()) as { customers: Customer[] };
}

function tagsFromInput(raw: string) {
  return raw
    .split(",")
    .map((t) => normalizeTag(t))
    .filter(Boolean)
    .slice(0, 20);
}

export function CustomersClient() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["customers", q, tag],
    queryFn: () => fetchCustomers(q, tag),
  });

  const customers = data?.customers || [];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of customers) for (const t of c.interestTags || []) set.add(t);
    return Array.from(set).sort();
  }, [customers]);

  const [form, setForm] = useState({
    id: "" as string | null,
    name: "",
    contact: "",
    favoriteDrink: "",
    interestTagsInput: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact || null,
          favoriteDrink: form.favoriteDrink || null,
          interestTags: tagsFromInput(form.interestTagsInput),
          notes: form.notes || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Create failed");
      return json as { customer: Customer };
    },
    onSuccess: async () => {
      setForm({
        id: null,
        name: "",
        contact: "",
        favoriteDrink: "",
        interestTagsInput: "",
        notes: "",
      });
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!form.id) throw new Error("Missing id");
      const res = await fetch(`/api/customers/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: form.contact || null,
          favoriteDrink: form.favoriteDrink || null,
          interestTags: tagsFromInput(form.interestTagsInput),
          notes: form.notes || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json as { customer: Customer };
    },
    onSuccess: async () => {
      setForm({
        id: null,
        name: "",
        contact: "",
        favoriteDrink: "",
        interestTagsInput: "",
        notes: "",
      });
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return true;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-border/70 bg-white/60 p-4 dark:bg-zinc-950/40">
          <div className="text-sm font-semibold">
            {form.id ? "Edit customer" : "Add customer"}
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama customer"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact (optional)</Label>
              <Input
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
                placeholder="Email / WhatsApp"
              />
            </div>
            <div className="space-y-2">
              <Label>Favorite drink/product</Label>
              <Input
                value={form.favoriteDrink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, favoriteDrink: e.target.value }))
                }
                placeholder="Contoh: Caramel Cold Brew"
              />
            </div>
            <div className="space-y-2">
              <Label>Interest tags (comma-separated)</Label>
              <Input
                value={form.interestTagsInput}
                onChange={(e) =>
                  setForm((f) => ({ ...f, interestTagsInput: e.target.value }))
                }
                placeholder='contoh: "sweet drinks, oat milk, pastry lover"'
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Catatan singkat..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  form.id ? updateMutation.mutate() : createMutation.mutate()
                }
                disabled={saving || !form.name.trim()}
                className="flex-1"
              >
                {saving ? "Saving..." : form.id ? "Save changes" : "Add customer"}
              </Button>
              {form.id ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      id: null,
                      name: "",
                      contact: "",
                      favoriteDrink: "",
                      interestTagsInput: "",
                      notes: "",
                    })
                  }
                >
                  Cancel
                </Button>
              ) : null}
            </div>
            {createMutation.error || updateMutation.error ? (
              <p className="text-sm text-red-700 dark:text-red-200">
                {(createMutation.error || updateMutation.error)?.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, interests, favorite..."
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter tag:</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="">All</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {isLoading ? "Loading..." : `${customers.length} results`}
          </div>
        </div>

        <Separator />

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {(error as Error).message}
          </div>
        ) : null}

        <div className="space-y-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border/70 bg-white/60 p-4 dark:bg-zinc-950/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{c.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {c.favoriteDrink ? (
                      <span>
                        Favorite: <b className="font-medium">{c.favoriteDrink}</b>
                      </span>
                    ) : (
                      <span>No favorite noted</span>
                    )}
                    {c.contact ? <span> · Contact: {c.contact}</span> : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setForm({
                        id: c.id,
                        name: c.name,
                        contact: c.contact || "",
                        favoriteDrink: c.favoriteDrink || "",
                        interestTagsInput: (c.interestTags || []).join(", "),
                        notes: c.notes || "",
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {c.interestTags && c.interestTags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(c.interestTags || []).map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="cursor-pointer hover:border-emerald-400"
                      onClick={() => setTag(t)}
                      title="Click to filter by this tag"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {c.notes ? (
                <div className="mt-3 text-sm text-muted-foreground">{c.notes}</div>
              ) : null}
            </div>
          ))}

          {!isLoading && customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
              No customers found. Add one on the left.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


