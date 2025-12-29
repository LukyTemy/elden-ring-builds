import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import BuildView from './BuildView';

// Definice typu pro props (params je v Next.js 15 Promise)
type Props = {
  params: Promise<{ id: string }>;
};

// Tahle funkce generuje HTML hlavičku pro Google/Reddit
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 1. TADY JE OPRAVA: Musíme přidat await před params
  const { id } = await params;

  // Rychlý fetch jen pro metadata
  const { data: build } = await supabase
    .from('builds')
    .select('name, stats')
    .eq('id', id)
    .single();

  if (!build) {
    return {
      title: 'Build Not Found | Elden Ring Planner',
    };
  }

  // Výpočet levelu pro metadata
  const level = Object.values(build.stats).reduce((a: any, b: any) => a + b, 0) - 79;
  const safeLevel = level > 1 ? level : 1;

  return {
    title: `${build.name} (Lvl ${safeLevel}) | Elden Ring Build`,
    description: `Check out this Elden Ring build! Level ${safeLevel} character featuring custom stats and equipment.`,
    openGraph: {
      title: `${build.name} - Elden Ring Build`,
      description: `Level ${safeLevel} Stats & Equipment breakdown.`,
    },
  };
}

// Komponenta stránky
export default async function Page({ params }: Props) {
  // I tady je params Promise, Next.js 15 to tak vyžaduje
  // BuildView si ID vytáhne samo pomocí useParams() (což už v BuildView máš a je to správně)
  return <BuildView />;
}