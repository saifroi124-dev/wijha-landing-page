// Supabase Edge Function: send new lead to Telegram when Database Webhook fires (INSERT on leads).
// Set secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (optional: NOTIFY_WEBHOOK_SECRET).

const TELEGRAM_API = "https://api.telegram.org";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: { fullname?: string; phone?: string; source?: string; id?: string };
  old_record: unknown;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors() });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors(), "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
  if (secret) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors(), "Content-Type": "application/json" },
      });
    }
  }

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return new Response(
      JSON.stringify({ error: "Telegram not configured" }),
      { status: 500, headers: { ...cors(), "Content-Type": "application/json" } }
    );
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors(), "Content-Type": "application/json" },
    });
  }

  if (payload.type !== "INSERT" || payload.table !== "leads" || !payload.record) {
    return new Response(JSON.stringify({ ok: true, skipped: "not a lead insert" }), {
      status: 200,
      headers: { ...cors(), "Content-Type": "application/json" },
    });
  }

  const r = payload.record;
  const name = r.fullname ?? "—";
  const phoneFormatted = formatPhone(r.phone);
  const source = r.source ?? "—";
  const sourceLabel =
    source === "business"
      ? "أصحاب المشاريع"
      : source === "students"
        ? "الطلاب"
        : source === "freelancers"
          ? "الفريلانسرز"
          : source;

  const text = `🆕 طلب جديد — وِجْهة\n\nالاسم: ${name}\nالهاتف: ${phoneFormatted}\nالمصدر: ${sourceLabel}`;

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Telegram API error", res.status, data);
    return new Response(
      JSON.stringify({ error: "Telegram send failed", details: data }),
      { status: 502, headers: { ...cors(), "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
});

function formatPhone(tel: string | undefined): string {
  if (!tel) return "—";
  const digits = tel.replace(/\D/g, "").replace(/^216/, "");
  if (digits.length === 0) return tel;
  return digits.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
}

function cors(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
  };
}
