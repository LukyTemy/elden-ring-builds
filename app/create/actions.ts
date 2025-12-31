"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const buildSchema = z.object({
  name: z.string().min(3, "Název musí mít alespoň 3 znaky").max(50).trim(),
  stats: z.object({
    vigor: z.number().int().min(1).max(99),
    mind: z.number().int().min(1).max(99),
    endurance: z.number().int().min(1).max(99),
    strength: z.number().int().min(1).max(99),
    dexterity: z.number().int().min(1).max(99),
    intelligence: z.number().int().min(1).max(99),
    faith: z.number().int().min(1).max(99),
    arcane: z.number().int().min(1).max(99),
  }),
  equipment: z.record(z.string(), z.string().uuid().nullable().or(z.literal(""))),
  talismans: z.array(z.string().uuid().nullable().or(z.literal(""))),
  spells: z.array(z.string().uuid().nullable().or(z.literal(""))),
  tears: z.array(z.string().uuid().nullable().or(z.literal(""))),
});

export async function createBuild(rawData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const validated = buildSchema.parse(rawData);

  const clean = (val: any) => (val === "" || val === undefined ? null : val);

  const cleanedEquipment = Object.fromEntries(
    Object.entries(validated.equipment).map(([key, val]) => [key, clean(val)])
  );

  const { data, error } = await supabase
    .from('builds')
    .insert({
      user_id: user.id,
      name: validated.name,
      stats: validated.stats,
      equipment: cleanedEquipment,
      talismans: validated.talismans.map(clean),
      spells: validated.spells.map(clean),
      crystal_tears: validated.tears.map(clean)
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  return { success: true, buildId: data.id };
}