// scripts/seed.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

// Kontrola klíčů
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Chyba: Nenalezeny klíče v .env.local');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Seznam kategorií, které chceme stáhnout
// Název = endpoint v API
const CATEGORIES = ['weapons', 'armors', 'shields', 'talismans', 'spirits'];

async function fetchCategory(category) {
  console.log(`⏳ Stahuji kategorii: ${category}...`);
  try {
    // Stáhneme 100 položek od každého (pro MVP stačí, API má stránkování)
    const response = await fetch(`https://eldenring.fanapis.com/api/${category}?limit=100`);
    const data = await response.json();
    
    // Mapování dat - sjednotíme různé formáty do naší tabulky
    const itemsToInsert = data.data.map((item) => {
      // Různé předměty mají různé statistiky, uložíme to, co je pro ně důležité
      let statsData = {};
      
      if (category === 'weapons' || category === 'shields') {
        statsData = { scaling: item.scalesWith, attack: item.attack };
      } else if (category === 'armors') {
        statsData = { negation: item.dmgNegation }; // Fyzická/Magická obrana
      } else if (category === 'talismans') {
        statsData = { effect: item.effect };
      } else if (category === 'spirits') {
        statsData = { fpCost: item.fpCost, hpCost: item.hpCost, effect: item.effect };
      }

      return {
        api_id: item.id,
        name: item.name,
        image: item.image,
        category: category, // 'weapons', 'armors' atd.
        description: item.description,
        stats: statsData // Uložíme jako JSON
      };
    });

    // Uložení do DB
    const { error } = await supabase
      .from('items')
      .upsert(itemsToInsert, { onConflict: 'api_id' });

    if (error) {
      console.error(`❌ Chyba u kategorie ${category}:`, error.message);
    } else {
      console.log(`✅ ${category}: Uloženo ${itemsToInsert.length} položek.`);
    }

  } catch (err) {
    console.error(`❌ Chyba stahování ${category}:`, err);
  }
}

async function seedAll() {
  console.log('⚔️  START SEEDING...');
  
  // Projdeme všechny kategorie jednu po druhé
  for (const cat of CATEGORIES) {
    await fetchCategory(cat);
  }
  
  console.log('🏁 Vše hotovo!');
}

seedAll();