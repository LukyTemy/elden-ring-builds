import { createClient } from "@/utils/supabase/server";
import ExploreClient from "./ExploreClient";

export default async function Page() {
  const supabase = await createClient();
  
  const { data: builds } = await supabase
    .from('builds')
    .select('*, profiles(username), favorites(count)')
    .order('created_at', { ascending: false });

  const populatedBuilds = builds?.map(b => ({
    ...b,
    favorites_count: b.favorites?.[0]?.count || 0
  })) || [];

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
          totalWeight += Number(item.weight) || 0;
        }

        const otherSlots = ['rightHand2', 'rightHand3', 'leftHand1', 'leftHand2', 'leftHand3', 'head', 'chest', 'hands', 'legs'];
        otherSlots.forEach(slot => {
          const id = build.equipment?.[slot];
          if (id && itemMap[id]) totalWeight += Number(itemMap[id].weight) || 0;
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

  return <ExploreClient initialBuilds={populatedBuilds} />;
}