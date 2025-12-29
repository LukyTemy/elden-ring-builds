import { createClient } from "@/utils/supabase/server";
import ExploreClient from "./ExploreClient";

export default async function Page() {
  const supabase = await createClient();
  
  // 1. Načteme buildy a profily autorů (původní dotaz)
  const { data: builds } = await supabase
    .from('builds')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });

  const populatedBuilds = [...(builds || [])];

  // 2. POPULACE OBRÁZKŮ ZBRANÍ (Stejná logika jako u Dashboardu)
  if (populatedBuilds.length > 0) {
    // Sesbíráme ID hlavních zbraní (rightHand1) ze všech zobrazených buildů
    const weaponIds = populatedBuilds
      .map(b => b.equipment?.rightHand1)
      .filter(id => id && typeof id === 'string');

    if (weaponIds.length > 0) {
      // Dotáhneme data k těmto zbraním z tabulky 'items'
      const { data: weapons } = await supabase
        .from('items')
        .select('id, name, image')
        .in('id', weaponIds);

      // Vytvoříme si mapu pro bleskové vyhledávání
      const weaponMap = Object.fromEntries(weapons?.map(w => [w.id, w]) || []);

      // Nahradíme ID zbraně celým objektem (jménem a obrázkem)
      populatedBuilds.forEach(build => {
        const wId = build.equipment?.rightHand1;
        if (wId && weaponMap[wId]) {
          // Teď už BuildCard najde build.equipment.rightHand1.image
          build.equipment.rightHand1 = weaponMap[wId];
        }
      });
    }
  }

  // Posíláme už kompletní data do klientské komponenty
  return <ExploreClient initialBuilds={populatedBuilds} />;
}