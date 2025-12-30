import { createClient } from "@/utils/supabase/server";
import ExploreClient from "./ExploreClient";

export default async function Page() {
  const supabase = await createClient();
  
  // 1. Načteme buildy, jména autorů a počet favoritů (přes count)
  const { data: builds } = await supabase
    .from('builds')
    .select('*, profiles(username), favorites(count)')
    .order('created_at', { ascending: false });

  const populatedBuilds = builds?.map(b => ({
    ...b,
    favorites_count: b.favorites?.[0]?.count || 0 // Převedeme strukturu countu na číslo
  })) || [];

  // 2. POPULACE OBRÁZKŮ ZBRANÍ PRO KARTY
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

  return <ExploreClient initialBuilds={populatedBuilds} />;
}