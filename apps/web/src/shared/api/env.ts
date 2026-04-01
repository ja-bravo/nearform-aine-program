export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== "undefined" && (!raw || !raw.trim())) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  return raw?.replace(/\/$/, "").trim() ?? "";
}
