import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "resumes";

type SubmitPayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  position_interest?: string;
  linkedin_url?: string;
  source?: string;
  consent_lgpd?: string | boolean;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

function sanitizeFileName(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
}

function parseConsent(value: string | boolean | undefined) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "sim", "on"].includes(normalized);
  }
  return false;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: "Supabase env vars are missing." }, 500);
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return jsonResponse({ error: "Content-Type deve ser multipart/form-data." }, 400);
    }

    const formData = await req.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return jsonResponse({ error: "Arquivo de currículo é obrigatório (campo resume)." }, 400);
    }

    if (file.size <= 0) {
      return jsonResponse({ error: "Arquivo enviado está vazio." }, 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonResponse({ error: `Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.` }, 400);
    }

    const extension = getExtension(file.name);
    const mimeType = (file.type || "").toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonResponse({ error: "Formato inválido. Envie PDF, DOC ou DOCX." }, 400);
    }

    const payload: SubmitPayload = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      city: String(formData.get("city") ?? "").trim() || undefined,
      state: String(formData.get("state") ?? "").trim() || undefined,
      position_interest: String(formData.get("position_interest") ?? "").trim() || undefined,
      linkedin_url: String(formData.get("linkedin_url") ?? "").trim() || undefined,
      source: String(formData.get("source") ?? "public_site").trim() || "public_site",
      consent_lgpd: formData.get("consent_lgpd") as string | boolean | undefined,
    };

    if (!payload.full_name || !payload.email) {
      return jsonResponse({ error: "full_name e email são obrigatórios." }, 400);
    }

    const consentLgpd = parseConsent(payload.consent_lgpd);
    if (!consentLgpd) {
      return jsonResponse({ error: "consent_lgpd deve ser true." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const safeName = sanitizeFileName(file.name || `resume${extension}`);
    const filePath = `${folder}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return jsonResponse({ error: `Falha ao enviar arquivo: ${uploadError.message}` }, 500);
    }

    const { data: candidateId, error: insertError } = await supabase.rpc("submit_candidate_application", {
      p_full_name: payload.full_name,
      p_email: payload.email,
      p_phone: payload.phone ?? null,
      p_city: payload.city ?? null,
      p_state: payload.state ?? null,
      p_position_interest: payload.position_interest ?? null,
      p_linkedin_url: payload.linkedin_url ?? null,
      p_resume_file_path: filePath,
      p_source: payload.source,
      p_consent_lgpd: consentLgpd,
      p_status: "novo",
    });

    if (insertError || !candidateId) {
      await supabase.storage.from(BUCKET).remove([filePath]);
      return jsonResponse({ error: `Falha ao registrar candidatura: ${insertError?.message ?? "erro desconhecido"}` }, 500);
    }

    return jsonResponse({ id: candidateId, status: "novo" }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno inesperado.";
    return jsonResponse({ error: message }, 500);
  }
});
