"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Msg = { role: "user" | "assistant"; content: string };

async function ask(question: string, history: Msg[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  const json = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
  if (!res.ok) throw new Error(json.error || "Chat failed");
  return json.answer || "";
}

export function ChatClient() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Halo Mimi! Kamu mau bikin promo apa minggu ini? Tanya aja: segment mana paling besar, ide message, atau rekomendasi campaign.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = useMemo(
    () => [
      "Bikin 3 ide promo minggu ini dari data customer (theme + segment + message).",
      "Segment terbesar sekarang apa? Kasih 2 ide campaign yang relevan.",
      "Buat message WhatsApp untuk pastry lovers jam pagi.",
      "Customer mana yang suka oat milk? Saran promo ringan untuk mereka.",
    ],
    [],
  );

  async function onSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setError(null);
    setLoading(true);
    const next = [...messages, { role: "user", content: q } as const];
    setMessages(next);
    try {
      const answer = await ask(q, next.slice(-10));
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((p) => (
          <Badge
            key={p}
            variant="outline"
            className="cursor-pointer hover:border-emerald-400"
            onClick={() => onSend(p)}
            title="Click to ask"
          >
            {p}
          </Badge>
        ))}
      </div>

      <div className="h-[420px] overflow-auto rounded-2xl border border-border/70 bg-white/60 p-4 dark:bg-zinc-950/40">
        <div className="space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-emerald-600 px-4 py-2 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl border border-border/70 bg-white/70 px-4 py-2 text-sm dark:bg-zinc-900/40"
              }
            >
              {m.content}
            </div>
          ))}
          {loading ? (
            <div className="mr-auto max-w-[85%] rounded-2xl border border-border/70 bg-white/70 px-4 py-2 text-sm text-muted-foreground dark:bg-zinc-900/40">
              Thinking...
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang promo, segment, atau customer..."
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
        />
        <Button onClick={() => onSend()} disabled={loading}>
          Send
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Jika AI key belum diset, endpoint chat akan error. Set <code className="font-mono">OPENROUTER_API_KEY</code> atau{" "}
        <code className="font-mono">GROQ_API_KEY</code>.
      </p>
    </div>
  );
}


