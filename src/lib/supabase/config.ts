export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === "https:" ||
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1") &&
      anonKey.length > 0
    );
  } catch {
    return false;
  }
}
