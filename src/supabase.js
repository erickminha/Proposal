import { createClient } from "@supabase/supabase-js";

// Substitua pelos seus dados do Supabase:
// Painel Supabase → Settings → API → Project URL e anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "VITE_SUPABASE_URL="https://xwftbbeouzfanlfqerlx.supabase.co" 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZnRiYmVvdXpmYW5sZnFlcmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTc2MjUsImV4cCI6MjA4NzY5MzYyNX0.b4uYotL2ZBcKd1hfrG87QLeqrCxML4p6O_-HTHfJvfo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
