import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// `EXPO_PUBLIC_SUPABASE_KEY` is the project's public/anon or publishable key.
// `EXPO_PUBLIC_SUPABASE_ANON_KEY` is accepted as a fallback for compatibility.
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in your .env file.",
  );
}

let parsedUrl;
try {
  parsedUrl = new URL(supabaseUrl);
} catch {
  throw new Error(
    "Invalid EXPO_PUBLIC_SUPABASE_URL: it must be a full http(s) URL, e.g. https://<project-ref>.supabase.co",
  );
}

if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
  throw new Error(
    "Invalid EXPO_PUBLIC_SUPABASE_URL: the URL must use the http or https protocol.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
