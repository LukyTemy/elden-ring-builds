import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Build", // Díky šabloně v hlavním layoutu to bude: "New Build | Elden Ring Planner"
  description: "Craft your ultimate tarnished. Select weapons, armor, and stats.",
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}