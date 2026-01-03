export function isAdmin(email: string | undefined, allowlistCsv: string | undefined, domain: string | undefined): boolean {
  const e = (email || "").toLowerCase();
  if (!e) return false;
  const allowlist = (allowlistCsv || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length && allowlist.includes(e)) return true;
  const d = (domain || "").toLowerCase();
  if (d && e.endsWith(`@${d}`)) return true;
  return false;
}