import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "My Saved Builds",
};

export default async function SavedBuildsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please login to view saved builds");
  }

  // Složitější dotaz: Stáhni Favorites a k nim připoj detaily z tabulky Builds
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      build_id,
      builds (
        id,
        name,
        stats
      )
    `)
    .eq("user_id", user.id);

  return (
    <div className="max-w-4xl mx-auto min-h-[60vh]">
      <h1 className="text-3xl font-serif text-amber-500 mb-8 border-b border-stone-800 pb-4">
        Saved Builds
      </h1>

      {(!favorites || favorites.length === 0) ? (
        <div className="text-center text-stone-500 py-20">
          <p className="mb-4">You haven't saved any builds yet.</p>
          <Link href="/builds" className="text-amber-500 hover:underline">
            Explore builds to add some!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav: any) => (
            <Link 
              key={fav.build_id} 
              href={`/build/${fav.build_id}`}
              className="block bg-stone-900/50 border border-stone-800 p-6 rounded hover:border-amber-600 transition-colors group"
            >
              <h3 className="text-xl text-stone-200 font-serif group-hover:text-amber-500 mb-2">
                {fav.builds.name}
              </h3>
              <p className="text-stone-500 text-sm">
                 Level {Object.values(fav.builds.stats).reduce((a: any, b: any) => a + b, 0) - 79}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}