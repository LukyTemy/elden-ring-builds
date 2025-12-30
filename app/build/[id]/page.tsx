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
  const statsValues = Object.values(build.stats || {});
  const level = statsValues.reduce((a: any, b: any) => a + (Number(b) || 0), 0) - 79;
  return { title: `${build.name} (Lvl ${level > 1 ? level : 1}) | Elden Ring Builder` };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: build, error } = await supabase.from('builds').select('*').eq('id', id).single();
  if (error || !build) notFound();

  const { count: likesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('build_id', id);

  const { data: { user } } = await supabase.auth.getUser();
  let userHasLiked = false;
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('build_id', id)
      .eq('user_id', user.id)
      .single();
    userHasLiked = !!fav;
  }

  const equipmentIds = Object.values(build.equipment || {}).filter(Boolean);
  const talismanIds = (build.talismans || []).filter(Boolean);
  const spellIds = (build.spells || []).filter(Boolean);
  const tearIds = (build.crystal_tears || []).filter(Boolean);
  const allIds = Array.from(new Set([...equipmentIds, ...talismanIds, ...spellIds, ...tearIds]));
  const { data: items } = await supabase.from('items').select('*').in('id', allIds);
  const itemMap = Object.fromEntries(items?.map(i => [i.id, i]) || []);

  const populatedBuild = {
    ...build,
    equipment: Object.fromEntries(Object.entries(build.equipment || {}).map(([slot, itemId]) => [slot, itemMap[itemId as string] || null])),
    talismans: (build.talismans || []).map((id: string) => itemMap[id] || null),
    spells: (build.spells || []).map((id: string) => itemMap[id] || null),
    crystal_tears: (build.crystal_tears || []).map((id: string) => itemMap[id] || null),
    likes_count: likesCount || 0,
    is_liked: userHasLiked
  };

  return <BuildView initialBuild={populatedBuild} userId={user?.id} />;
}