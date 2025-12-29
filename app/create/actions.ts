"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBuild(formData: {
  name: string;
  stats: any;
  equipment: any;
  talismans: string[];
  spells: string[];
  tears: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from('builds').insert({
    user_id: user.id,
    name: formData.name,
    stats: formData.stats,
    equipment: formData.equipment,
    talismans: formData.talismans,
    spells: formData.spells,
    crystal_tears: formData.tears
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/builds");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}