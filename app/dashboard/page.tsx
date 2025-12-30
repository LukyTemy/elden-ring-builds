import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: builds, error } = await supabase
    .from('builds')
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Chyba při načítání buildů:", error.message);
  }

  const populatedBuilds = [...(builds || [])];
  
  if (populatedBuilds.length > 0) {
    const weaponIds = populatedBuilds
      .map(b => b.equipment?.rightHand1)
      .filter(id => id && typeof id === 'string');

    if (weaponIds.length > 0) {
      const { data: weapons } = await supabase
        .from('items')
        .select('id, name, image')
        .in('id', weaponIds);

      const weaponMap = Object.fromEntries(weapons?.map(w => [w.id, w]) || []);

      populatedBuilds.forEach(build => {
        const wId = build.equipment?.rightHand1;
        if (wId && weaponMap[wId]) {
          build.equipment.rightHand1 = weaponMap[wId];
        }
      });
    }
  }

  return <DashboardClient initialBuilds={populatedBuilds} />;
}