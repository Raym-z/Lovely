import "server-only";

import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type StorageMode = "supabase" | "file";

export interface StoredPage {
  config: string;
  editKeyHash: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePageResult = {
  uid: string;
  editKey: string;
  storage: StorageMode;
};

export type UpdatePageResult =
  | { ok: true; storage: StorageMode }
  | { ok: false; reason: "not_found" | "forbidden" };

const TABLE = "lovely_pages";
const UID_PATTERN = /^[a-z0-9]{4,32}$/;
const UID_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

let supabaseClient: SupabaseClient | null | undefined;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseSecretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

export function getStorageConfigIssue(): string | null {
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey();
  if (!url || !key) return null;

  if (key.startsWith("sb_publishable_")) {
    return "Supabase is using a publishable key. Add the project's secret key (SUPABASE_SECRET_KEY) on the server; the publishable key cannot bypass row-level security.";
  }

  if (key.startsWith("sb_anon_")) {
    return "Supabase is using an anon key. Add the project's secret key (SUPABASE_SECRET_KEY) on the server.";
  }

  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString("utf8"),
      ) as { role?: string };
      if (payload.role === "anon") {
        return "Supabase is using an anon key. Add the project's secret key (SUPABASE_SECRET_KEY) on the server.";
      }
    } catch {
      // Not a decodable JWT; let Supabase report any other issue.
    }
  }

  return null;
}

function getSupabase() {
  if (supabaseClient !== undefined) return supabaseClient;

  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseSecretKey();

  if (!url || !serviceRoleKey) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

export function getStorageMode(): StorageMode {
  return getSupabase() ? "supabase" : "file";
}

export function isValidUid(uid: string) {
  return UID_PATTERN.test(uid);
}

function generateUid() {
  const bytes = crypto.randomBytes(9);
  let uid = "";

  for (let index = 0; index < 8; index += 1) {
    uid += UID_ALPHABET[bytes[index] % UID_ALPHABET.length];
  }

  return uid;
}

function generateEditKey() {
  return crypto.randomBytes(18).toString("base64url");
}

function hashEditKey(editKey: string) {
  return crypto.createHash("sha256").update(editKey).digest("hex");
}

function editKeyMatches(editKey: string, storedHash: string) {
  const candidate = Buffer.from(hashEditKey(editKey), "hex");
  const stored = Buffer.from(storedHash, "hex");

  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

function filePath(uid: string) {
  return path.join(process.cwd(), ".data", "lovely", `${uid}.json`);
}

async function readFilePage(uid: string): Promise<StoredPage | null> {
  try {
    const raw = await readFile(filePath(uid), "utf8");
    return JSON.parse(raw) as StoredPage;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

async function writeFilePage(uid: string, page: StoredPage) {
  const directory = path.join(process.cwd(), ".data", "lovely");
  await mkdir(directory, { recursive: true });
  await writeFile(filePath(uid), JSON.stringify(page), {
    encoding: "utf8",
    flag: "wx",
  });
}

export async function getPage(uid: string): Promise<StoredPage | null> {
  if (!isValidUid(uid)) return null;

  const supabase = getSupabase();
  if (!supabase) {
    return readFilePage(uid);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("config, edit_key_hash, created_at, updated_at")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    config: data.config as string,
    editKeyHash: data.edit_key_hash as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function createPage(config: string): Promise<CreatePageResult> {
  const supabase = getSupabase();
  const storage: StorageMode = supabase ? "supabase" : "file";

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const uid = generateUid();
    const editKey = generateEditKey();
    const editKeyHash = hashEditKey(editKey);
    const now = new Date().toISOString();

    if (supabase) {
      const { error } = await supabase.from(TABLE).insert({
        id: uid,
        config,
        edit_key_hash: editKeyHash,
        created_at: now,
        updated_at: now,
      });

      if (!error) return { uid, editKey, storage };
      if (error.code === "23505") continue;
      throw new Error(error.message);
    }

    try {
      await writeFilePage(uid, {
        config,
        editKeyHash,
        createdAt: now,
        updatedAt: now,
      });
      return { uid, editKey, storage };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "EEXIST"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not allocate a unique Lovely id.");
}

export async function updatePage(
  uid: string,
  config: string,
  editKey: string,
): Promise<UpdatePageResult> {
  if (!isValidUid(uid)) return { ok: false, reason: "not_found" };

  const stored = await getPage(uid);
  if (!stored) return { ok: false, reason: "not_found" };
  if (!editKeyMatches(editKey, stored.editKeyHash)) {
    return { ok: false, reason: "forbidden" };
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .update({ config, updated_at: now })
      .eq("id", uid);

    if (error) throw new Error(error.message);
    return { ok: true, storage: "supabase" };
  }

  await writeFile(filePath(uid), JSON.stringify({
    ...stored,
    config,
    updatedAt: now,
  }), "utf8");

  return { ok: true, storage: "file" };
}
