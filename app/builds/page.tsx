import { createClient } from "@/utils/supabase/server";
import ExploreClient from "./ExploreClient";

export default async function Page() {
  const supabase = await createClient();
  
  // Data načteme už na serveru - žádné nekonečné kolečko v prohlížeči
  const { data: builds } = await supabase
    .from('builds')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });

  return <ExploreClient initialBuilds={builds || []} />;
}