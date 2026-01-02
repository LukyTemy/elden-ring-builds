import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: builds, error } = await supabase
    .from('builds')
    .select(`*, profiles (username), favorites (count)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const populatedBuilds = (builds || []).map(build => ({
    ...build,
    favorites_count: (build as any).favorites?.[0]?.count || 0
  }));
  
  if (populatedBuilds.length > 0) {
    const itemIds = new Set<string>();
    populatedBuilds.forEach(build => {
      Object.values(build.equipment || {}).forEach(id => {
        if (id && typeof id === 'string') itemIds.add(id);
      });
      (build.talismans || []).forEach(id => {
        if (id && typeof id === 'string') itemIds.add(id);
      });
    });

    if (itemIds.size > 0) {
      const { data: items } = await supabase
        .from('items')
        .select('id, name, image, weight')
        .in('id', Array.from(itemIds));

      const itemMap = Object.fromEntries(items?.map(i => [i.id, i]) || []);

      populatedBuilds.forEach(build => {
        let totalWeight = 0;
        if (build.equipment?.rightHand1 && itemMap[build.equipment.rightHand1]) {
          const item = itemMap[build.equipment.rightHand1];
          build.equipment.rightHand1 = item;
        }

        Object.values(build.equipment || {}).forEach(id => {
          if (id && typeof id === 'string' && itemMap[id]) totalWeight += Number(itemMap[id].weight) || 0;
        });
        (build.talismans || []).forEach((id: string) => {
          if (id && itemMap[id]) totalWeight += Number(itemMap[id].weight) || 0;
        });

        const maxLoad = 45 + ((build.stats?.endurance || 10) * 1.5);
        const ratio = totalWeight / maxLoad;
        if (ratio < 0.3) build.rollType = "Light";
        else if (ratio < 0.7) build.rollType = "Medium";
        else if (ratio <= 1.0) build.rollType = "Heavy";
        else build.rollType = "Overloaded";
      });
    }
  }

  return <DashboardClient initialBuilds={populatedBuilds} />;
}