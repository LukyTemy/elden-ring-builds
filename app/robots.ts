import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Zase zatím placeholder, dokud nemáš doménu na Netlify.
  // Až ji budeš mít, přepíšeš to stejně jako v sitemap.ts.
  const baseUrl = 'https://tvoje-budouci-domena.netlify.app';

  return {
    rules: {
      userAgent: '*', // * znamená "všichni roboti" (Google, Bing, Seznam...)
      allow: '/',     // Povolit přístup na celou stránku
      disallow: [     // Sem píšeš cesty, kam roboti nesmí
        '/api/',      // Obvykle nechceš, aby Google indexoval tvé API endpointy
        '/admin/',    // Pokud bys časem přidal admin sekci
      ],
    },
    // Důležité: Next.js automaticky vygeneruje sitemap.xml ze souboru sitemap.ts
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}