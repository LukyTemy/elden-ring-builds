import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Builds",
  description: "Search through community created Elden Ring builds. Filter by stats, weapons, and playstyle.",
};

export default function BuildsLayout({
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