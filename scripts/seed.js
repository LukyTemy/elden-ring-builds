const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env variables! Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Vyhodil jsem crystal_tears, protože teď vrací chyby
const ENDPOINTS = [
  'weapons', 
  'shields', 
  'armors', 
  'talismans', 
  'sorceries', 
  'incantations', 
  'spirits'
];

// Opravená mapa včetně Gauntlet (singular)
const ARMOR_MAP = {
  'Helm': 'helm',
  'Chest Armor': 'chest',
  'Gauntlets': 'hands',
  'Gauntlet': 'hands', 
  'Leg Armor': 'legs'
};

function mapCategory(apiItem, endpoint) {
  // 1. ARMORS
  if (endpoint === 'armors') {
    if (apiItem.category && ARMOR_MAP[apiItem.category]) {
      return ARMOR_MAP[apiItem.category];
    }
    // Tiché ignorování neznámých kategorií, ať nespamujeme konzoli
    return null;
  }

  // 2. ZBRANĚ A ŠTÍTY
  if (endpoint === 'weapons' || endpoint === 'shields') {
    return 'weapons';
  }

  // 3. OSTATNÍ
  if (endpoint === 'talismans') return 'talismans';
  if (endpoint === 'spirits') return 'spirits';
  if (endpoint === 'sorceries' || endpoint === 'incantations') return 'spells';

  return null;
}

async function fetchAllItems(endpoint) {
  let allItems = [];
  let page = 0;
  let hasMore = true;

  console.log(`\n⬇️  Fetching ${endpoint}...`);

  while (hasMore) {
    try {
      const res = await fetch(`https://eldenring.fanapis.com/api/${endpoint}?limit=100&page=${page}`);
      
      // NEPRŮSTŘELNÁ KONTROLA: Nejdřív si vezmeme text, pak zkusíme parsovat
      const text = await res.text();
      
      try {
        const data = JSON.parse(text); // Tady to spadne, pokud to je HTML

        if (data.data && data.data.length > 0) {
          allItems = [...allItems, ...data.data];
          process.stdout.write('.'); 
          page++;
        } else {
          hasMore = false;
          console.log(` Done (${allItems.length} items)`);
        }
      } catch (jsonError) {
        console.warn(`\n⚠️ API Error for ${endpoint} page ${page}: Received HTML instead of JSON. Skipping rest of category.`);
        hasMore = false; // Ukončíme stahování této kategorie, ale neshodíme skript
      }
      
      await new Promise(r => setTimeout(r, 150));

    } catch (e) {
      console.error(`\n❌ Network Error fetching ${endpoint}:`, e.message);
      hasMore = false;
    }
  }
  return allItems;
}

async function seed() {
  console.log('--- ELDEN RING ROBUST SEEDER ---');
  
  console.log('🧹 Purging old data...');
  await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  let totalInserted = 0;

  for (const endpoint of ENDPOINTS) {
    const apiItems = await fetchAllItems(endpoint);
    
    const dbItems = apiItems.map(item => {
      const myCategory = mapCategory(item, endpoint);
      if (!myCategory) return null;

      return {
        name: item.name,
        image: item.image,
        description: item.description,
        category: myCategory,
        api_id: item.id
      };
    }).filter(i => i !== null);

    if (dbItems.length > 0) {
      const BATCH_SIZE = 500;
      for (let i = 0; i < dbItems.length; i += BATCH_SIZE) {
        const batch = dbItems.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('items').insert(batch);
        
        if (error) {
          console.error(`❌ DB Insert Error:`, error.message);
        } else {
          totalInserted += batch.length;
        }
      }
    }
  }

  console.log(`\n🎉 SEED FINISHED! Total items: ${totalInserted}`);
}

seed();