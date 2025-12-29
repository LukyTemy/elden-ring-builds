import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. ZATÍM NEZNÁMÁ DOMÉNA
  // Jakmile budeš mít projekt na Netlify, dostaneš URL jako "moje-appka.netlify.app".
  // Až si koupíš doménu, přepíšeš to na "https://eldenringplanner.com".
  // Pro teď tam dej prázdný string nebo localhost, ale pro Google to pak MUSÍŠ změnit.
  const baseUrl = 'https://tvoje-budouci-domena.netlify.app';

  return [
    {
      url: baseUrl, // Domovská stránka (Home)
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/builds`, // Seznam buildů (Explore)
      lastModified: new Date(),
      changeFrequency: 'daily', // Tady se obsah mění často
      priority: 0.8,
    },
    {
      url: `${baseUrl}/create`, // Tvorba buildu
      lastModified: new Date(),
      changeFrequency: 'monthly', // Nástroj se mění málo
      priority: 0.8,
    },
    // Dynamické stránky (build/[id]) sem zatím nedáváme natvrdo.
    // Google si je najde přes odkazy na stránce /builds.
    // Pokud bys je sem chtěl dostat všechny, museli bychom napojit databázi.
  ];
}