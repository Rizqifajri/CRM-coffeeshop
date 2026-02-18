import { GLOBAL_PROMO_SYSTEM_PROMPT, CHATBOT_SYSTEM_PROMPT } from "@/ai/prompts";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const defaultModel = process.env.AI_MODEL || "openai/gpt-4.1-mini";

async function callLLM(messages: AIMessage[]) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Prefer OpenRouter, fallback to Groq if configured
  const provider = openRouterKey ? "openrouter" : groqKey ? "groq" : null;
  if (!provider) {
    throw new Error("No AI provider key found (OPENROUTER_API_KEY or GROQ_API_KEY)");
  }

  const url =
    provider === "openrouter"
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

  const apiKey = provider === "openrouter" ? openRouterKey! : groqKey!;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter extra metadata headers (safe to omit for Groq)
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://mimi-coffeshop.vercel.app";
    headers["X-Title"] = "Mimi Coffee CRM";
  }

  const model =
    provider === "groq"
      ? // pick a common Groq model unless overridden
        (process.env.AI_MODEL || "llama-3.1-8b-instant")
      : defaultModel;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${provider} error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = json.choices[0]?.message?.content;
  if (!content) throw new Error("No content returned from AI provider");
  return content;
}

export async function generateGlobalPromosFromData(payload: {
  customers: unknown;
  interestsSummary: unknown;
}) {
  const userContent = [
    "Berikut data customers dan ringkasan interest tags.",
    "",
    "=== CUSTOMERS ===",
    JSON.stringify(payload.customers, null, 2),
    "",
    "=== INTEREST TAG SUMMARY ===",
    JSON.stringify(payload.interestsSummary, null, 2),
    "",
    "Tolong balas dengan format JSON array berisi objek:",
    `[{ "theme": string, "segment": string, "whyNow": string, "message": string, "bestTimeWindow"?: string }]`,
    "Tanpa penjelasan lain di luar JSON.",
  ].join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: GLOBAL_PROMO_SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];

  const raw = await callLLM(messages);

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("AI response is not an array");
    }
    return parsed as {
      theme: string;
      segment: string;
      whyNow: string;
      message: string;
      bestTimeWindow?: string;
    }[];
  } catch (err) {
    console.error("Failed to parse AI JSON, returning raw text", err);
    return [
      {
        theme: "AI Promo Ideas (Free-form)",
        segment: "See description",
        whyNow: "Model returned non-JSON output.",
        message: raw,
      },
    ];
  }
}

export async function chatWithMimiAssistant(input: {
  question: string;
  customers: unknown;
  interestsSummary: unknown;
  recentCampaigns: unknown;
  history?: { role: "user" | "assistant"; content: string }[];
}) {
  const contextBlocks = [
    "=== CUSTOMER SNAPSHOT ===",
    JSON.stringify(input.customers, null, 2),
    "",
    "=== INTEREST TAG SUMMARY ===",
    JSON.stringify(input.interestsSummary, null, 2),
    "",
    "=== RECENT CAMPAIGNS (if any) ===",
    JSON.stringify(input.recentCampaigns, null, 2),
  ].join("\n");

  const messages: AIMessage[] = [
    { role: "system", content: CHATBOT_SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        "Gunakan konteks di bawah ini untuk menjawab pertanyaan Mimi.",
        "",
        contextBlocks,
        "",
        `Pertanyaan: ${input.question}`,
      ].join("\n"),
    },
  ];

  if (input.history && input.history.length > 0) {
    messages.splice(
      1,
      0,
      ...input.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    );
  }

  const answer = await callLLM(messages);
  return answer;
}


