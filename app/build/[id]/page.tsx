import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import BuildView from './BuildView'; // Importujeme tu komponentu s UI

// Tahle funkce generuje HTML hlavičku pro Google/Reddit
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;

  // Rychlý fetch jen pro metadata
  const { data: build } = await supabase
    .from('builds')
    .select('name, stats')
    .eq('id', id)
    .single();

  if (!build) {
    return {
      title: 'Build Not Found | Elden Ring Builder',
    };
  }

  const level = Object.values(build.stats).reduce((a: any, b: any) => a + b, 0) - 79;
  const safeLevel = level > 1 ? level : 1;

  return {
    title: `${build.name} (Lvl ${safeLevel}) | Elden Ring Build`,
    description: `Check out this Elden Ring build! Level ${safeLevel} character featuring custom stats and equipment. Create your own builds at Elden Ring Builder.`,
    openGraph: {
      title: `${build.name} - Elden Ring Build`,
      description: `Level ${safeLevel} Stats & Equipment breakdown.`,
      // Pokud nemáme dynamický obrázek, použijeme defaultní (později tam můžeš dát screenshot webu)
      // images: ['/og-image-default.jpg'], 
    },
  };
}

// Toto je samotná stránka
export default function Page() {
  return <BuildView />;
}