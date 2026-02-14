export function sanitizeInviteCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^[A-Z0-9]{6,16}$/i.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

export function sanitizeProfile(input: {
  anonymous_name: unknown;
  bio: unknown;
  gender: unknown;
}): { anonymous_name: string; bio: string | null; gender: string | null } {
  const anonymous_name =
    typeof input.anonymous_name === "string"
      ? input.anonymous_name.trim().slice(0, 32)
      : "";

  const bio =
    typeof input.bio === "string"
      ? input.bio.trim().slice(0, 240)
      : null;

  const gender =
    typeof input.gender === "string"
      ? input.gender.trim().slice(0, 32)
      : null;

  return { anonymous_name, bio, gender };
}

export function sanitizeMessage(content: unknown): string | null {
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (trimmed.length > 500) return trimmed.slice(0, 500);
  return trimmed;
}

export function sanitizeWhatsAppNumber(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // Remove all non-digit characters except +
  let cleaned = raw.trim().replace(/[^\d+]/g, '');
  
  // Must start with + and have at least 10 digits
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Remove the + for counting, then add it back
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  
  return '+' + digits;
}


