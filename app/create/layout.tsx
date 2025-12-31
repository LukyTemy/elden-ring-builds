import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "New Build", 
  description: "Craft your ultimate tarnished. Select weapons, armor, and stats.",
};

export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=You must be logged in to create a build");
  }

  return (
    <>
      {children}
    </>
  );
}