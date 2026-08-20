// functions/api/contact.js — Cloudflare Pages Function for the contact form.
// Contract: _config/cloudflare.md. POST /api/contact only.
// No storage of any kind, no cookies, no CORS headers, no retries.
// The only outbound call is to MailChannels.

const MAILCHANNELS_ENDPOINT = "https://api.mailchannels.net/tx/v1/send";

const FROM_EMAIL = "noreply@no.fail";
const FROM_NAME = "no.fail contact form";

const ROUTE_SENT = "/contact/sent/";
const ROUTE_ERROR = "/contact/error/";

// Field bounds — _config/cloudflare.md § Fields, exactly.
const NAME_MIN = 1;
const NAME_MAX = 200;
const EMAIL_MAX = 254;
const COMPANY_MAX = 200;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 5000;

/** JSON response. No cookies, no CORS headers, no provider body ever echoed. */
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** 303 so the browser re-issues the follow-up as GET after a POST. */
function redirect(path) {
  return new Response(null, { status: 303, headers: { location: path } });
}

function str(value) {
  return typeof value === "string" ? value : "";
}

/**
 * Parse the two body encodings the contract lists.
 * Returns { fields, wantsJson } or null when the encoding is unsupported.
 */
async function parseBody(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    let data;
    try {
      data = await request.json();
    } catch {
      return { fields: null, wantsJson: true };
    }
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { fields: null, wantsJson: true };
    }
    return {
      wantsJson: true,
      fields: {
        name: str(data.name),
        email: str(data.email),
        company: str(data.company),
        message: str(data.message),
        website: str(data.website),
      },
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    let form;
    try {
      form = new URLSearchParams(await request.text());
    } catch {
      return { fields: null, wantsJson: false };
    }
    return {
      wantsJson: false,
      fields: {
        name: str(form.get("name")),
        email: str(form.get("email")),
        company: str(form.get("company")),
        message: str(form.get("message")),
        website: str(form.get("website")),
      },
    };
  }

  return null;
}

/**
 * Syntactic email check per the contract: one @ with content either side.
 * No regex heroics — delivery is the real validator.
 */
function emailLooksValid(value) {
  const at = value.indexOf("@");
  if (at < 1) return false;
  if (at !== value.lastIndexOf("@")) return false;
  if (at === value.length - 1) return false;
  if (/\s/.test(value)) return false;
  return true;
}

/**
 * Validate against the field table.
 * Error reasons are machine codes, not visitor-facing prose: the JS handler
 * renders the copy-owned form_state_error note and the no-JS path redirects to
 * a built route. See output/raw/form-notes.md.
 */
function validate(raw) {
  const fields = {
    name: raw.name.trim(),
    email: raw.email.trim(),
    company: raw.company.trim(),
    message: raw.message.trim(),
  };
  const errors = {};

  if (fields.name.length < NAME_MIN) errors.name = "required";
  else if (fields.name.length > NAME_MAX) errors.name = "too_long";

  if (fields.email.length === 0) errors.email = "required";
  else if (fields.email.length > EMAIL_MAX) errors.email = "too_long";
  else if (!emailLooksValid(fields.email)) errors.email = "invalid";

  if (fields.company.length > COMPANY_MAX) errors.company = "too_long";

  if (fields.message.length === 0) errors.message = "required";
  else if (fields.message.length < MESSAGE_MIN) errors.message = "too_short";
  else if (fields.message.length > MESSAGE_MAX) errors.message = "too_long";

  return { fields, errors };
}

/** Plain text, labelled, one field per line, message last. */
function mailText(fields) {
  return [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Company: ${fields.company}`,
    "Message:",
    fields.message,
  ].join("\n");
}

async function sendMail(env, fields) {
  // The destination lives only in the CONTACT_TO_EMAIL binding. It is never
  // written into this file, in any form, including as a fallback.
  const to = env && env.CONTACT_TO_EMAIL;
  if (!to) return false;

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email: fields.email, name: fields.name },
    subject: `no.fail contact — ${fields.name}`,
    content: [{ type: "text/plain", value: mailText(fields) }],
  };

  let response;
  try {
    response = await fetch(MAILCHANNELS_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return false;
  }

  // The provider's response body is read by nothing and returned to nobody.
  return response.ok;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const parsed = await parseBody(request);
  if (parsed === null) {
    return json({ ok: false }, 415);
  }

  const { fields: raw, wantsJson } = parsed;

  if (raw === null) {
    return wantsJson
      ? json({ ok: false, errors: { body: "unparseable" } }, 400)
      : redirect(ROUTE_ERROR);
  }

  // Honeypot: answer as success, send nothing. A bot learns nothing.
  if (raw.website.trim().length > 0) {
    return wantsJson ? json({ ok: true }, 200) : redirect(ROUTE_SENT);
  }

  const { fields, errors } = validate(raw);
  if (Object.keys(errors).length > 0) {
    return wantsJson
      ? json({ ok: false, errors }, 400)
      : redirect(ROUTE_ERROR);
  }

  const sent = await sendMail(env, fields);
  if (!sent) {
    return wantsJson ? json({ ok: false }, 502) : redirect(ROUTE_ERROR);
  }

  return wantsJson ? json({ ok: true }, 200) : redirect(ROUTE_SENT);
}

/** Any other method on this path. */
export function onRequest() {
  return new Response(null, { status: 405, headers: { allow: "POST" } });
}
