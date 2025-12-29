import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 1. STÁHNEME BUILDY A ZÁROVEŇ I USERNAME Z TABULKY PROFILŮ
  // Předpokládám, že máš v DB relaci builds.user_id -> profiles.id
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

  // 2. POPULACE OBRÁZKŮ ZBRANÍ PRO KARTY
  // Musíme pro každý build zjistit ID jeho hlavní zbraně a stáhnout k ní data
  const populatedBuilds = [...(builds || [])];
  
  if (populatedBuilds.length > 0) {
    // Sesbíráme všechna ID zbraní ze všech buildů na stránce
    const weaponIds = populatedBuilds
      .map(b => b.equipment?.rightHand1)
      .filter(id => id && typeof id === 'string');

    if (weaponIds.length > 0) {
      const { data: weapons } = await supabase
        .from('items')
        .select('id, name, image')
        .in('id', weaponIds);

      const weaponMap = Object.fromEntries(weapons?.map(w => [w.id, w]) || []);

      // Nahradíme ID zbraně celým objektem zbraně, aby ho BuildCard mohl vykreslit
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