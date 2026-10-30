import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SOURCE = "groupme";
const GROUPME_API = "https://api.groupme.com/v3";
const MAX_MESSAGES = 20;
const MAX_THREAD = 4;
const THREAD_WINDOW_MS = 10 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getServiceKey(): string {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      const defaultKey = parsed?.default;
      if (typeof defaultKey === "string" && defaultKey.trim()) return defaultKey;
      if (defaultKey && typeof defaultKey.key === "string" && defaultKey.key.trim()) return defaultKey.key;
    } catch {
      // Fall through to the legacy compatibility secret.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = getServiceKey();
const groupMeToken = Deno.env.get("GROUPME_TOKEN") ?? "";
const groupMeGroupId = Deno.env.get("GROUPME_GROUP_ID") ?? "";
const groupMeBotId = Deno.env.get("GROUPME_BOT_ID") ?? "";
const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceKey);

type GroupMeMessage = {
  id?: string;
  text?: string;
  created_at?: number;
  user_id?: string;
  sender_type?: string;
  system?: boolean;
};

type GroupMeResponse = { response?: { messages?: GroupMeMessage[]; name?: string } };

async function groupMeFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Access-Token", groupMeToken);
  headers.set("Accept", "application/json");
  return fetch(`${GROUPME_API}${path}`, { ...init, headers });
}

async function groupMeError(response: Response): Promise<string> {
  try {
    const payload = await response.json() as { meta?: { errors?: unknown } };
    const errors = payload.meta?.errors;
    if (Array.isArray(errors)) return errors.filter((item): item is string => typeof item === "string").join("; ");
  } catch {
    // Fall through to the status code when GroupMe does not return JSON.
  }
  return `HTTP ${response.status}`;
}

async function readGroup(groupId: string, lastId: string): Promise<{ messages: GroupMeMessage[]; groupName: string }> {
  const query = lastId ? `?after_id=${encodeURIComponent(lastId)}&limit=${MAX_MESSAGES}` : `?limit=${MAX_MESSAGES}`;
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupId)}/messages${query}`);
  if (response.status === 304) return { messages: [], groupName: "" };
  if (!response.ok) throw new Error(`GroupMe returned ${response.status} while reading messages: ${await groupMeError(response)}`);
  const payload = await response.json() as GroupMeResponse;
  return { messages: [...(payload.response?.messages ?? [])].reverse(), groupName: clean(payload.response?.name) };
}

async function recentThread(message: GroupMeMessage, groupId: string): Promise<string[]> {
  const sender = clean(message.user_id);
  const messageId = clean(message.id);
  const createdAt = Number(message.created_at ?? 0) * 1000;
  if (!sender || !messageId || !createdAt) return [];
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupId)}/messages?before_id=${encodeURIComponent(messageId)}&limit=20`);
  if (!response.ok) return [];
  const payload = await response.json() as GroupMeResponse;
  return (payload.response?.messages ?? [])
    .filter((item) => clean(item.user_id) === sender && clean(item.text) && Number(item.created_at ?? 0) * 1000 >= createdAt - THREAD_WINDOW_MS)
    .sort((a, b) => Number(a.created_at ?? 0) - Number(b.created_at ?? 0))
    .slice(-MAX_THREAD)
    .map((item) => clean(item.text));
}

async function postToGroup(text: string): Promise<void> {
  if (!groupMeBotId || !text) return;
  await groupMeFetch("/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: groupMeBotId, text: text.slice(0, 1000) }),
  });
}

function decisionText(result: Record<string, unknown>): string {
  if (result.already_read) return "";
  const message = clean(result.message);
  return message ? `Event Radar: ${message}` : `Event Radar: ${clean(result.status) || "The post was received."}.`;
}

async function sendToAgent(message: GroupMeMessage, groupName: string, thread: string[]): Promise<Record<string, unknown>> {
  const response = await fetch(`${supabaseUrl}/functions/v1/submit-event`, {
    method: "POST",
    headers: { "apikey": publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ announcement: clean(message.text), source: SOURCE, source_id: clean(message.id), source_name: groupName || "GroupMe", thread }),
  });
  if (!response.ok) throw new Error(`submit-event returned ${response.status}.`);
  return await response.json() as Record<string, unknown>;
}

async function getCursor(): Promise<{ last_id: string; read_count: number }> {
  const { data, error } = await admin.from("channel_cursor").select("last_id, read_count").eq("source", SOURCE).maybeSingle();
  if (error) throw error;
  return { last_id: clean(data?.last_id), read_count: Number(data?.read_count ?? 0) };
}

async function saveCursor(lastId: string, readCount: number): Promise<void> {
  const { error } = await admin.from("channel_cursor").upsert({ source: SOURCE, last_id: lastId, read_count: readCount, updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function checkGroup(): Promise<Response> {
  if (!groupMeToken || !groupMeGroupId) return jsonResponse({ ok: false, ready: false, message: "GroupMe token or group is not configured." }, 503);
  const response = await groupMeFetch(`/groups/${encodeURIComponent(groupMeGroupId)}`);
  return jsonResponse({ ok: response.ok, ready: response.ok, group: response.ok ? "reachable" : "unreachable", bot: groupMeBotId ? "configured" : "not configured", ...(response.ok ? {} : { error: await groupMeError(response) }) }, response.ok ? 200 : 502);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!groupMeToken || !groupMeGroupId || !serviceKey || !supabaseUrl || !publishableKey) {
    if (request.method === "GET" && new URL(request.url).searchParams.get("check") === SOURCE) return checkGroup();
    return jsonResponse({ ok: false, ready: false, message: "The GroupMe reader is not configured." }, 503);
  }
  if (request.method === "GET") {
    if (new URL(request.url).searchParams.get("check") === SOURCE) return checkGroup();
    const cursor = await getCursor();
    return jsonResponse({ ok: true, ready: true, last_message_id: cursor.last_id, read_count: cursor.read_count, bot: groupMeBotId ? "configured" : "not configured" });
  }
  if (request.method !== "POST") return jsonResponse({ ok: false, message: "Use GET or POST." }, 405);

  try {
    const cursor = await getCursor();
    const batch = await readGroup(groupMeGroupId, cursor.last_id);
    if (!cursor.last_id) {
      const newest = batch.messages.reduce((latest, item) => Number(item.created_at ?? 0) > Number(latest?.created_at ?? 0) ? item : latest, undefined as GroupMeMessage | undefined);
      if (newest?.id) await saveCursor(clean(newest.id), cursor.read_count);
      return jsonResponse({ ok: true, initialized: true, last_message_id: clean(newest?.id), read_count: cursor.read_count });
    }

    let lastId = cursor.last_id;
    let readCount = cursor.read_count;
    for (const message of batch.messages) {
      if (!message.id) continue;
      lastId = clean(message.id);
      readCount += 1;
      const isBot = message.sender_type === "bot" || (groupMeBotId && clean(message.user_id) === groupMeBotId) || message.system === true;
      if (!isBot && clean(message.text)) {
        try {
          const result = await sendToAgent(message, batch.groupName, await recentThread(message, groupMeGroupId));
          const reply = decisionText(result);
          if (reply) await postToGroup(reply);
        } catch (error) {
          console.error("GroupMe message processing failed", error);
        }
      }
      await saveCursor(lastId, readCount);
    }
    return jsonResponse({ ok: true, read: batch.messages.length, last_message_id: lastId, read_count: readCount, bot: groupMeBotId ? "configured" : "not configured" });
  } catch (error) {
    console.error("GroupMe reader failed", error);
    return jsonResponse({ ok: false, message: "The GroupMe reader could not complete this run." }, 502);
  }
});
