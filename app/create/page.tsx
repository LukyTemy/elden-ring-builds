import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateBuildForm from "./CreateBuildForm";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=You must be logged in to create a build");
  }

  return <CreateBuildForm userId={user.id} />;
}