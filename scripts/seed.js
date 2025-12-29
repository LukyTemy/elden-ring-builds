const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 1. Endpointy, které fungují a budeme je stahovat
const API_ENDPOINTS = [
  'weapons', 
  'shields', 
  'armors', 
  'talismans', 
  'sorceries', 
  'incantations', 
  'spirits'
];

// 2. Manuální seznam Crystal Tears (protože API je rozbité)
const MANUAL_CRYSTAL_TEARS = [
  { name: "Crimson Crystal Tear", description: "Restores 50% HP", image: "https://eldenring.fanapis.com/images/crystal_tears/crimson_crystal_tear.png" },
  { name: "Crimsonspill Crystal Tear", description: "Boosts max HP for 3 minutes", image: null },
  { name: "Crimsonburst Crystal Tear", description: "Restores 7 HP for 3 minutes", image: null },
  { name: "Cerulean Crystal Tear", description: "Restores 50% FP", image: null },
  { name: "Greenspill Crystal Tear", description: "Boosts max Stamina for 3 minutes", image: null },
  { name: "Greenburst Crystal Tear", description: "Boosts Stamina recovery for 3 minutes", image: null },
  { name: "Strength-knot Crystal Tear", description: "Boosts Strength for 3 minutes", image: null },
  { name: "Dexterity-knot Crystal Tear", description: "Boosts Dexterity for 3 minutes", image: null },
  { name: "Intelligence-knot Crystal Tear", description: "Boosts Intelligence for 3 minutes", image: null },
  { name: "Faith-knot Crystal Tear", description: "Boosts Faith for 3 minutes", image: null },
  { name: "Opaline Hardtear", description: "Boosts damage negation for 3 minutes", image: null },
  { name: "Speckled Hardtear", description: "Boosts resistances and heals status for 3 minutes", image: null },
  { name: "Leaden Hardtear", description: "Boosts Poise for 10 seconds", image: null },
  { name: "Magic-Shrouding Cracked Tear", description: "Boosts Magic Damage for 3 minutes", image: null },
  { name: "Flame-Shrouding Cracked Tear", description: "Boosts Fire Damage for 3 minutes", image: null },
  { name: "Lightning-Shrouding Cracked Tear", description: "Boosts Lightning Damage for 3 minutes", image: null },
  { name: "Holy-Shrouding Cracked Tear", description: "Boosts Holy Damage for 3 minutes", image: null },
  { name: "Stonebarb Cracked Tear", description: "Boosts Stance and stamina damage to blocks for 30 seconds", image: null },
  { name: "Spiked Cracked Tear", description: "Enhances charged attacks for 3 minutes", image: null },
  { name: "Thorny Cracked Tear", description: "Enhances consecutive attacks for 3 minutes", image: null },
  { name: "Twiggy Cracked Tear", description: "Prevents Rune loss on death within 3 minutes", image: null },
  { name: "Winged Crystal Tear", description: "Reduces equipment load and light roll for 3 minutes", image: null },
  { name: "Windy Crystal Tear", description: "Enhances dodge rolls for 3 minutes", image: null },
  { name: "Crimson Bubbletear", description: "Restores HP when near death once within 3 minutes", image: null },
  { name: "Crimsonwhorl Bubbletear", description: "Converts Damage received in HP for 15 seconds", image: null },
  { name: "Opaline Bubbletear", description: "Significantly negates damage on next hit within 3 minutes", image: null },
  { name: "Cerulean Hidden Tear", description: "Eliminates all FP consumption for 10 seconds", image: null },
  { name: "Purifying Crystal Tear", description: "Purifies the Lord of Blood's curse", image: null },
  { name: "Ruptured Crystal Tear", description: "Explosion after a short delay", image: null },
  { name: "Bloodsucking Cracked Tear", description: "Enhances attacks at the cost of HP for 3 minutes", image: null },
  { name: "Cerulean-Sapping Cracked Tear", description: "Grants attacks FP-restoring effect for 45 seconds", image: null },
  { name: "Crimsonburst Dried Tear", description: "Steadily restores HP of nearby allies for 3 minutes", image: null },
  { name: "Crimson-Sapping Cracked Tear", description: "Grants attacks HP-restoring effect for 45 seconds", image: null },
  { name: "Deflecting Hardtear", description: "Enhances spontaneous guard for 5 minutes", image: null },
  { name: "Glovewort Crystal Tear", description: "Enhances attacks of spirits for 3 minutes", image: null },
  { name: "Oil-Soaked Tear", description: "Coats nearby enemies with oil for 30 seconds", image: null },
  { name: "Viridian Hidden Tear", description: "Eliminates stamina consumption for 10 seconds", image: null }
];

const ARMOR_MAP = {
  'Helm': 'helm',
  'Chest Armor': 'chest',
  'Gauntlets': 'hands',
  'Gauntlet': 'hands',
  'Leg Armor': 'legs'
};

function mapCategory(apiItem, endpoint) {
  if (endpoint === 'armors') {
    if (apiItem.category && ARMOR_MAP[apiItem.category]) {
      return ARMOR_MAP[apiItem.category];
    }
    return null;
  }
  if (endpoint === 'weapons' || endpoint === 'shields') return 'weapons';
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
      const text = await res.text();
      
      try {
        const data = JSON.parse(text);
        if (data.data && data.data.length > 0) {
          allItems = [...allItems, ...data.data];
          process.stdout.write('.'); 
          page++;
        } else {
          hasMore = false;
          console.log(` Done (${allItems.length} items)`);
        }
      } catch (jsonError) {
        console.warn(`\n⚠️ API Error for ${endpoint}: Invalid JSON. Skipping.`);
        hasMore = false;
      }
      await new Promise(r => setTimeout(r, 150));
    } catch (e) {
      console.error(`\n❌ Network Error ${endpoint}:`, e.message);
      hasMore = false;
    }
  }
  return allItems;
}

async function seed() {
  console.log('--- ELDEN RING HYBRID SEEDER STARTING ---');
  
  // 1. Vymazání starých dat
  console.log('🧹 Purging old data...');
  const { error: delErr } = await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) console.error("Delete Error:", delErr.message);

  let totalInserted = 0;

  // 2. Stahování z API (Zbraně, Armor, atd.)
  for (const endpoint of API_ENDPOINTS) {
    const apiItems = await fetchAllItems(endpoint);
    
    const dbItems = apiItems.map(item => {
      const myCategory = mapCategory(item, endpoint);
      if (!myCategory) return null;

      return {
        name: item.name,
        image: item.image,
        description: item.description,
        category: myCategory,
        weight: item.weight || 0, // Zde ukládáme váhu!
        api_id: item.id
      };
    }).filter(i => i !== null);

    if (dbItems.length > 0) {
      const BATCH_SIZE = 500;
      for (let i = 0; i < dbItems.length; i += BATCH_SIZE) {
        const batch = dbItems.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('items').insert(batch);
        if (!error) totalInserted += batch.length;
      }
    }
  }

  // 3. Vložení manuálních Crystal Tears
  console.log(`\n💧 Injecting ${MANUAL_CRYSTAL_TEARS.length} Crystal Tears manually...`);
  const tearsData = MANUAL_CRYSTAL_TEARS.map(tear => ({
    name: tear.name,
    description: tear.description,
    image: tear.image, // Bude null, dokud neseženeme URL, ale item tam bude
    category: 'crystal_tears',
    weight: 0
  }));

  const { error: tearErr } = await supabase.from('items').insert(tearsData);
  if (tearErr) console.error("Error inserting tears:", tearErr.message);
  else totalInserted += tearsData.length;

  console.log(`\n🎉 SEED FINISHED! Total items in DB: ${totalInserted}`);
}

seed();