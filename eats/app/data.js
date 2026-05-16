// data.js — ported from src/lib/eats-data.ts
// Single global namespace so all babel scripts can read it.

const INGREDIENT_DB = {
  "high fructose corn syrup": { name: "High Fructose Corn Syrup", flag: "red", reason: "Insulin resistance + fatty liver" },
  "red 40": { name: "Red 40", flag: "red", reason: "Synthetic dye; behavioral concerns" },
  "yellow 5": { name: "Yellow 5", flag: "red", reason: "Synthetic dye; allergy + hyperactivity" },
  "yellow 6": { name: "Yellow 6", flag: "red", reason: "Synthetic dye; allergy flag" },
  "blue 1": { name: "Blue 1", flag: "red", reason: "Synthetic dye" },
  "bha": { name: "BHA", flag: "red", reason: "Possible carcinogen (NTP)" },
  "bht": { name: "BHT", flag: "red", reason: "Endocrine + carcinogen flag" },
  "tbhq": { name: "TBHQ", flag: "red", reason: "Petroleum-derived preservative" },
  "sodium nitrite": { name: "Sodium Nitrite", flag: "red", reason: "Forms nitrosamines when heated" },
  "partially hydrogenated": { name: "Partially Hydrogenated Oil", flag: "red", reason: "Trans fats; cardiovascular risk" },
  "aspartame": { name: "Aspartame", flag: "red", reason: "WHO 2B carcinogen" },
  "sucralose": { name: "Sucralose", flag: "red", reason: "Gut-microbiome disruption" },
  "potassium bromate": { name: "Potassium Bromate", flag: "red", reason: "Banned in EU/UK/Canada" },
  "azodicarbonamide": { name: "Azodicarbonamide", flag: "red", reason: "Banned in EU" },
  "monosodium glutamate": { name: "MSG", flag: "red", reason: "Headache + sensitivity reports" },
  "carrageenan": { name: "Carrageenan", flag: "yellow", reason: "GI inflammation in some studies" },
  "natural flavors": { name: "Natural Flavors", flag: "yellow", reason: "Vague — could be 100+ undisclosed" },
  "soybean oil": { name: "Soybean Oil", flag: "yellow", reason: "Highly processed, omega-6 heavy", allergens: ["soy"] },
  "canola oil": { name: "Canola Oil", flag: "yellow", reason: "Industrial processing" },
  "palm oil": { name: "Palm Oil", flag: "yellow", reason: "Saturated; deforestation" },
  "maltodextrin": { name: "Maltodextrin", flag: "yellow", reason: "Spikes blood sugar > sugar" },
  "soy lecithin": { name: "Soy Lecithin", flag: "yellow", reason: "Common allergen, often GMO", allergens: ["soy"] },
  "cane sugar": { name: "Cane Sugar", flag: "yellow", reason: "Added sugar — keep <25g/day" },
  "sea salt": { name: "Sea Salt", flag: "yellow", reason: "Sodium watch" },
  "wheat flour": { name: "Wheat Flour", flag: "yellow", reason: "Refined; gluten allergen", allergens: ["gluten"] },
  "milk": { name: "Milk", flag: "yellow", reason: "Dairy allergen", allergens: ["dairy"] },
  "eggs": { name: "Eggs", flag: "yellow", reason: "Common allergen", allergens: ["egg"] },
  "peanuts": { name: "Peanuts", flag: "red", reason: "Severe allergen", allergens: ["peanut"] },
  "oats": { name: "Oats", flag: "green", reason: "Beta-glucan; cholesterol support" },
  "olive oil": { name: "Olive Oil", flag: "green", reason: "Anti-inflammatory" },
  "avocado oil": { name: "Avocado Oil", flag: "green", reason: "Heart-healthy" },
  "almonds": { name: "Almonds", flag: "green", reason: "Magnesium + Vit E", allergens: ["tree-nut"] },
  "chickpeas": { name: "Chickpeas", flag: "green", reason: "Plant protein + fiber" },
  "lentils": { name: "Lentils", flag: "green", reason: "Iron + folate" },
  "quinoa": { name: "Quinoa", flag: "green", reason: "Complete protein + magnesium" },
  "spinach": { name: "Spinach", flag: "green", reason: "Iron, folate, magnesium" },
  "blueberries": { name: "Blueberries", flag: "green", reason: "Anthocyanins; brain support" },
  "sea moss": { name: "Sea Moss", flag: "green", reason: "92 minerals; alkaline staple" },
  "turmeric": { name: "Turmeric", flag: "green", reason: "Curcumin; anti-inflammatory" },
  "garlic": { name: "Garlic", flag: "green", reason: "Allicin; immune support" },
  "tahini": { name: "Tahini", flag: "green", reason: "Calcium + healthy fats" },
  "sprouted grain": { name: "Sprouted Grain", flag: "green", reason: "Higher bioavailable nutrients" },
};

function analyzeIngredients(text) {
  const lower = (text || "").toLowerCase();
  const flags = [];
  const allergens = new Set();
  let red = 0, yellow = 0, green = 0;
  for (const key of Object.keys(INGREDIENT_DB)) {
    if (lower.includes(key)) {
      const ing = INGREDIENT_DB[key];
      flags.push({ key, ingredient: ing });
      if (ing.flag === "red") red++;
      else if (ing.flag === "yellow") yellow++;
      else green++;
      (ing.allergens || []).forEach((a) => allergens.add(a));
    }
  }
  let score = 80 + green * 6 - red * 14 - yellow * 5;
  if (flags.length === 0) score = 60;
  return { score: Math.max(0, Math.min(100, score)), red, yellow, green, flags, allergens: [...allergens] };
}

const SAMPLE_LABEL = `Enriched wheat flour, soybean oil, palm oil, cane sugar, cheese seasoning (whey, salt, monosodium glutamate, natural flavors, yellow 5, yellow 6), TBHQ for freshness, soy lecithin.`;

const CATEGORIES = ["Snacks", "Cereals", "Dairy", "Beverages", "Frozen", "Sauces"];

const SWAP_DB = [
  { category: "Snacks", fromName: "Cheesy Crackers", fromBrand: "Cheez-It", fromScore: 38, fromIssues: ["TBHQ", "Soybean Oil", "Yellow 6"], toName: "Sprouted Seed Crackers", toBrand: "Mary's Gone", toScore: 86, reasons: ["No artificial preservatives", "Sprouted whole grains", "Lower sodium"], nutrition: { sodium: [230, 80], sugar: [0, 0], fiber: [1, 3] }, carries: ["sevananda", "wholefoods", "tj"] },
  { category: "Snacks", fromName: "Original Chips", fromBrand: "Lay's", fromScore: 42, fromIssues: ["Seed Oil", "Sodium"], toName: "Avocado Oil Chips", toBrand: "Siete", toScore: 78, reasons: ["Cooked in avocado oil", "Grain-free", "No seed oils"], nutrition: { sodium: [170, 90], sugar: [0, 0], fiber: [1, 2] }, carries: ["wholefoods", "tj", "sprouts"] },
  { category: "Cereals", fromName: "Frosted Flakes", fromBrand: "Kellogg's", fromScore: 32, fromIssues: ["BHT", "Cane Sugar", "Yellow 5"], toName: "Sprouted Power Flakes", toBrand: "Ezekiel 4:9", toScore: 88, reasons: ["Sprouted grains", "No added sugar", "Higher protein"], nutrition: { sodium: [190, 75], sugar: [12, 0], fiber: [1, 6] }, carries: ["sevananda", "wholefoods", "kroger"] },
  { category: "Cereals", fromName: "Honey Nut Os", fromBrand: "Cheerios", fromScore: 48, fromIssues: ["Cane Sugar", "Natural Flavors"], toName: "Steel-Cut Oats", toBrand: "Bob's Red Mill", toScore: 92, reasons: ["Single ingredient", "Beta-glucan fiber", "Slow-release energy"], nutrition: { sodium: [190, 0], sugar: [9, 1], fiber: [3, 4] }, carries: ["sevananda", "wholefoods", "kroger", "tj"] },
  { category: "Dairy", fromName: "Strawberry Yogurt", fromBrand: "Yoplait", fromScore: 36, fromIssues: ["HFCS", "Red 40"], toName: "Plain Greek + Berries", toBrand: "Stonyfield", toScore: 82, reasons: ["No artificial color", "2x protein", "Live probiotics"], nutrition: { sodium: [105, 65], sugar: [18, 4], fiber: [0, 2] }, carries: ["wholefoods", "kroger", "tj"] },
  { category: "Beverages", fromName: "Citrus Soda", fromBrand: "Mountain Dew", fromScore: 18, fromIssues: ["HFCS", "Yellow 5"], toName: "Sparkling Water + Lime", toBrand: "Spindrift", toScore: 94, reasons: ["No added sugar", "Real fruit juice", "Zero artificial color"], nutrition: { sodium: [60, 0], sugar: [46, 1], fiber: [0, 0] }, carries: ["wholefoods", "tj", "kroger", "sprouts"] },
  { category: "Frozen", fromName: "Pepperoni Pizza", fromBrand: "DiGiorno", fromScore: 28, fromIssues: ["Sodium Nitrite", "Soybean Oil"], toName: "Cauliflower Crust Veggie", toBrand: "Caulipower", toScore: 74, reasons: ["No nitrites", "Cauliflower base", "Fewer additives"], nutrition: { sodium: [780, 380], sugar: [6, 3], fiber: [2, 4] }, carries: ["wholefoods", "kroger", "sprouts"] },
  { category: "Sauces", fromName: "Tomato Ketchup", fromBrand: "Heinz", fromScore: 44, fromIssues: ["HFCS", "Natural Flavors"], toName: "Organic Ketchup, No Sugar", toBrand: "Primal Kitchen", toScore: 84, reasons: ["No HFCS", "No added sugar", "Organic tomatoes"], nutrition: { sodium: [160, 110], sugar: [4, 0], fiber: [0, 0] }, carries: ["wholefoods", "sprouts", "tj"] },
];

const SOURCES = [
  { id: "sevananda", name: "Sevananda Natural Foods", short: "Sevananda", type: "Co-op", distance: 1.2, transparency: 96, price: 2, carries: ["sea moss", "tahini", "sprouted grain", "lentils", "quinoa"], x: 22, y: 38 },
  { id: "freedom-fm", name: "Freedom Farmers Market", short: "Freedom FM", type: "Farmer's Market", distance: 0.8, transparency: 92, price: 2, carries: ["spinach", "blueberries", "garlic", "turmeric"], x: 36, y: 22 },
  { id: "wholefoods", name: "Whole Foods Ponce", short: "Whole Foods", type: "Grocery", distance: 2.1, transparency: 78, price: 3, carries: ["sea moss", "tahini", "olive oil", "almonds", "sprouted grain", "quinoa"], x: 50, y: 30 },
  { id: "tj", name: "Trader Joe's Midtown", short: "Trader Joe's", type: "Grocery", distance: 1.6, transparency: 70, price: 1, carries: ["olive oil", "almonds", "blueberries", "oats", "quinoa"], x: 64, y: 44 },
  { id: "kroger", name: "Kroger Edgewood", short: "Kroger", type: "Grocery", distance: 1.1, transparency: 58, price: 1, carries: ["oats", "lentils", "olive oil"], x: 45, y: 60 },
  { id: "sprouts", name: "Sprouts Farmers Market", short: "Sprouts", type: "Grocery", distance: 3.4, transparency: 74, price: 2, carries: ["sea moss", "tahini", "almonds", "turmeric", "quinoa"], x: 78, y: 56 },
  { id: "rainbow", name: "Rainbow Grocery", short: "Rainbow", type: "Specialty", distance: 2.7, transparency: 90, price: 2, carries: ["sea moss", "tahini", "sprouted grain", "turmeric"], x: 18, y: 70 },
  { id: "atl-farm", name: "ATL Urban Farm Stand", short: "ATL Urban", type: "Farmer's Market", distance: 1.9, transparency: 94, price: 2, carries: ["spinach", "blueberries", "garlic", "almonds"], x: 60, y: 80 },
];

const NUTRIENTS = [
  { name: "Iron", value: "9.2 mg", target: "12.0 mg", status: "low" },
  { name: "Vitamin D", value: "28 ng/mL", target: "40 ng/mL", status: "low" },
  { name: "Magnesium", value: "420 mg", target: "320 mg", status: "high" },
  { name: "Hydration", value: "92%", target: "85%", status: "good" },
  { name: "Fiber", value: "31 g", target: "25 g", status: "good" },
  { name: "Potassium", value: "4.1 g", target: "3.5 g", status: "good" },
];

const MEAL_PLANS = [
  { slot: "Breakfast", name: "Steel-Cut Oats + Blueberries + Almonds", cost: 2.40, ingredients: ["steel-cut oats", "blueberries", "almonds", "cinnamon"], nutrients: ["Iron", "Magnesium", "Fiber"], time: "12 min" },
  { slot: "Lunch", name: "Lentil + Spinach Power Bowl", cost: 4.10, ingredients: ["lentils", "spinach", "quinoa", "olive oil", "garlic", "tahini"], nutrients: ["Iron", "Folate", "Protein"], time: "22 min" },
  { slot: "Dinner", name: "Sea Moss Smoothie + Sprouted Toast", cost: 5.30, ingredients: ["sea moss gel", "blueberries", "almond milk", "sprouted grain bread", "tahini"], nutrients: ["Vitamin D", "Calcium", "Iodine"], time: "8 min" },
];

// Synthetic 14-day score history (with mild noise) — represents user's last 2 weeks of decoded scans.
const SCORE_HISTORY = (() => {
  const arr = [];
  for (let i = 13; i >= 0; i--) {
    const base = 54 + Math.round(Math.sin(i * 0.7) * 10) + (i < 4 ? 12 : 0);
    arr.push(Math.max(20, Math.min(96, base)));
  }
  return arr;
})();

const RECENT_SCANS = [
  { name: "Sprouted Power Flakes", brand: "Ezekiel 4:9", score: 88, when: "Today · 8:02 AM", flag: "green" },
  { name: "Plain Greek + Berries", brand: "Stonyfield", score: 82, when: "Yesterday · 7:30 PM", flag: "green" },
  { name: "Cheesy Crackers", brand: "Cheez-It", score: 38, when: "Yesterday · 3:11 PM", flag: "red" },
  { name: "Sparkling Water + Lime", brand: "Spindrift", score: 94, when: "Sun · 1:24 PM", flag: "green" },
  { name: "Tomato Ketchup", brand: "Heinz", score: 44, when: "Sat · 6:48 PM", flag: "red" },
];

Object.assign(window, {
  INGREDIENT_DB, analyzeIngredients, SAMPLE_LABEL, CATEGORIES, SWAP_DB,
  SOURCES, NUTRIENTS, MEAL_PLANS, SCORE_HISTORY, RECENT_SCANS,
});
