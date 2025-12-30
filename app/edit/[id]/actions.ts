"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBuild(id: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const clean = (val: any) => (val === "" || val === undefined ? null : val);

  const cleanedEquipment = Object.fromEntries(
    Object.entries(data.equipment || {}).map(([key, val]) => [key, clean(val)])
  );

  const { error } = await supabase
    .from("builds")
    .update({
      name: data.name,
      stats: data.stats,
      equipment: cleanedEquipment,
      talismans: (data.talismans || []).map(clean),
      spells: (data.spells || []).map(clean),
      crystal_tears: (data.tears || []).map(clean),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/build/${id}`);
  revalidatePath("/dashboard");
  
  return { success: true };
}