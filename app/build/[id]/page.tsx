import { Metadata } from 'next';
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import BuildView from './BuildView';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: build } = await supabase.from('builds').select('name, stats').eq('id', id).single();
  if (!build) return { title: 'Build Not Found' };
  const level = Object.values(build.stats).reduce((a: any, b: any) => a + b, 0) - 79;
  return { title: `${build.name} (Lvl ${level > 1 ? level : 1}) | Elden Ring Builder` };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Načteme základní data buildu
  const { data: build, error } = await supabase.from('builds').select('*').eq('id', id).single();
  if (error || !build) notFound();

  // 2. Sesbíráme všechna ID předmětů, která v buildu jsou
  const equipmentIds = Object.values(build.equipment).filter(Boolean);
  const talismanIds = build.talismans.filter(Boolean);
  const spellIds = build.spells.filter(Boolean);
  const tearIds = build.crystal_tears.filter(Boolean);
  
  const allIds = Array.from(new Set([...equipmentIds, ...talismanIds, ...spellIds, ...tearIds]));

  // 3. Stáhneme detaily k těmto ID z tabulky 'items'
  const { data: items } = await supabase.from('items').select('*').in('id', allIds);
  
  // Vytvoříme si mapu (id -> objekt itemu) pro rychlé vyhledávání
  const itemMap = Object.fromEntries(items?.map(i => [i.id, i]) || []);

  // 4. "Naplníme" (populate) build skutečnými daty předmětů místo pouhých ID
  const populatedBuild = {
    ...build,
    equipment: Object.fromEntries(
      Object.entries(build.equipment).map(([slot, itemId]) => [slot, itemMap[itemId as string] || null])
    ),
    talismans: build.talismans.map((id: string) => itemMap[id] || null),
    spells: build.spells.map((id: string) => itemMap[id] || null),
    crystal_tears: build.crystal_tears.map((id: string) => itemMap[id] || null),
  };

  return <BuildView initialBuild={populatedBuild} />;
}