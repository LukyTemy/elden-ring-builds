import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditBuildForm from "./EditBuildForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Načteme build a všechny položky najednou
  const [buildRes, itemsRes1, itemsRes2] = await Promise.all([
    supabase.from("builds").select("*").eq("id", id).single(),
    supabase.from('items').select('*').range(0, 999),
    supabase.from('items').select('*').range(1000, 1999)
  ]);

  if (buildRes.error || !buildRes.data) notFound();
  if (buildRes.data.user_id !== user.id) redirect("/dashboard");

  const allItems = [...(itemsRes1.data || []), ...(itemsRes2.data || [])];

  return (
    <EditBuildForm 
      key={id} // Nutí React komponentu resetovat při změně ID
      buildId={id} 
      initialData={buildRes.data} 
      userId={user.id} 
      allItems={allItems} 
    />
  );
}