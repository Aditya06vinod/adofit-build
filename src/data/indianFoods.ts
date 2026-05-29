export interface FoodItem {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "fruit" | "vegetable" | "grain" | "dairy" | "beverage";
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving: string;
  tags: string[];
}

export const indianFoods: FoodItem[] = [
  // ========== BREAKFAST ==========
  { id: "b1", name: "Poha (Flattened Rice)", category: "breakfast", emoji: "🍚", calories: 270, protein: 5, carbs: 48, fat: 7, fiber: 2, serving: "1 plate (200g)", tags: ["Vegetarian", "Light"] },
  { id: "b2", name: "Upma (Semolina)", category: "breakfast", emoji: "🍲", calories: 235, protein: 6, carbs: 38, fat: 7, fiber: 3, serving: "1 bowl (200g)", tags: ["Vegetarian", "South Indian"] },
  { id: "b3", name: "Idli (2 pcs)", category: "breakfast", emoji: "🫓", calories: 130, protein: 4, carbs: 26, fat: 1, fiber: 1, serving: "2 pcs (100g)", tags: ["Vegetarian", "Steamed", "Low Fat"] },
  { id: "b4", name: "Dosa (Plain)", category: "breakfast", emoji: "🥞", calories: 168, protein: 4, carbs: 28, fat: 5, fiber: 1, serving: "1 dosa (120g)", tags: ["Vegetarian", "South Indian"] },
  { id: "b5", name: "Masala Dosa", category: "breakfast", emoji: "🥞", calories: 310, protein: 7, carbs: 42, fat: 13, fiber: 3, serving: "1 dosa (200g)", tags: ["Vegetarian", "South Indian"] },
  { id: "b6", name: "Aloo Paratha", category: "breakfast", emoji: "🫓", calories: 320, protein: 7, carbs: 44, fat: 14, fiber: 3, serving: "1 paratha (130g)", tags: ["Vegetarian", "North Indian"] },
  { id: "b7", name: "Paneer Paratha", category: "breakfast", emoji: "🫓", calories: 360, protein: 13, carbs: 40, fat: 17, fiber: 2, serving: "1 paratha (140g)", tags: ["Vegetarian", "High Protein"] },
  { id: "b8", name: "Chole Bhature (1 pc)", category: "breakfast", emoji: "🍛", calories: 450, protein: 12, carbs: 55, fat: 20, fiber: 6, serving: "1 bhatura + chole", tags: ["Vegetarian", "Heavy"] },
  { id: "b9", name: "Medu Vada (2 pcs)", category: "breakfast", emoji: "🍩", calories: 280, protein: 10, carbs: 28, fat: 14, fiber: 3, serving: "2 pcs (120g)", tags: ["Vegetarian", "Fried"] },
  { id: "b10", name: "Uttapam", category: "breakfast", emoji: "🥞", calories: 200, protein: 5, carbs: 34, fat: 5, fiber: 2, serving: "1 uttapam (150g)", tags: ["Vegetarian", "South Indian"] },
  { id: "b11", name: "Sabudana Khichdi", category: "breakfast", emoji: "🍚", calories: 310, protein: 5, carbs: 52, fat: 10, fiber: 1, serving: "1 bowl (200g)", tags: ["Vegetarian", "Fasting"] },
  { id: "b12", name: "Puri Bhaji (2 pcs)", category: "breakfast", emoji: "🫓", calories: 380, protein: 8, carbs: 48, fat: 18, fiber: 4, serving: "2 puris + bhaji", tags: ["Vegetarian", "North Indian"] },
  { id: "b13", name: "Oats Porridge", category: "breakfast", emoji: "🥣", calories: 180, protein: 7, carbs: 32, fat: 4, fiber: 4, serving: "1 bowl (200g)", tags: ["Healthy", "High Fiber"] },
  { id: "b14", name: "Besan Cheela", category: "breakfast", emoji: "🥞", calories: 210, protein: 10, carbs: 22, fat: 9, fiber: 3, serving: "2 pcs (120g)", tags: ["Vegetarian", "High Protein"] },
  { id: "b15", name: "Egg Bhurji", category: "breakfast", emoji: "🍳", calories: 250, protein: 18, carbs: 4, fat: 18, fiber: 1, serving: "2 eggs (150g)", tags: ["Non-Veg", "High Protein"] },

  // ========== LUNCH / DINNER ==========
  { id: "l1", name: "Dal Chawal", category: "lunch", emoji: "🍛", calories: 380, protein: 14, carbs: 62, fat: 8, fiber: 5, serving: "1 plate (300g)", tags: ["Vegetarian", "Staple"] },
  { id: "l2", name: "Rajma Chawal", category: "lunch", emoji: "🍛", calories: 420, protein: 16, carbs: 68, fat: 8, fiber: 8, serving: "1 plate (350g)", tags: ["Vegetarian", "High Protein"] },
  { id: "l3", name: "Chicken Curry", category: "lunch", emoji: "🍗", calories: 320, protein: 28, carbs: 10, fat: 19, fiber: 2, serving: "1 bowl (200g)", tags: ["Non-Veg", "High Protein"] },
  { id: "l4", name: "Paneer Butter Masala", category: "lunch", emoji: "🧀", calories: 380, protein: 18, carbs: 14, fat: 28, fiber: 2, serving: "1 bowl (200g)", tags: ["Vegetarian", "Rich"] },
  { id: "l5", name: "Chole (Chickpea Curry)", category: "lunch", emoji: "🍛", calories: 290, protein: 12, carbs: 38, fat: 10, fiber: 8, serving: "1 bowl (200g)", tags: ["Vegetarian", "High Fiber"] },
  { id: "l6", name: "Roti (Wheat)", category: "lunch", emoji: "🫓", calories: 85, protein: 3, carbs: 18, fat: 1, fiber: 2, serving: "1 roti (30g)", tags: ["Vegetarian", "Staple"] },
  { id: "l7", name: "Jeera Rice", category: "lunch", emoji: "🍚", calories: 210, protein: 4, carbs: 42, fat: 4, fiber: 1, serving: "1 cup (150g)", tags: ["Vegetarian", "Staple"] },
  { id: "l8", name: "Biryani (Chicken)", category: "lunch", emoji: "🍚", calories: 490, protein: 22, carbs: 58, fat: 18, fiber: 2, serving: "1 plate (300g)", tags: ["Non-Veg", "Rich"] },
  { id: "l9", name: "Biryani (Veg)", category: "lunch", emoji: "🍚", calories: 380, protein: 10, carbs: 62, fat: 12, fiber: 4, serving: "1 plate (300g)", tags: ["Vegetarian", "Rich"] },
  { id: "l10", name: "Palak Paneer", category: "lunch", emoji: "🥬", calories: 280, protein: 16, carbs: 12, fat: 20, fiber: 4, serving: "1 bowl (200g)", tags: ["Vegetarian", "Iron Rich"] },
  { id: "l11", name: "Aloo Gobi", category: "lunch", emoji: "🥔", calories: 180, protein: 4, carbs: 24, fat: 8, fiber: 4, serving: "1 bowl (200g)", tags: ["Vegetarian", "Light"] },
  { id: "l12", name: "Fish Curry", category: "lunch", emoji: "🐟", calories: 260, protein: 24, carbs: 8, fat: 14, fiber: 1, serving: "1 bowl (200g)", tags: ["Non-Veg", "Omega-3"] },
  { id: "l13", name: "Egg Curry (2 eggs)", category: "lunch", emoji: "🥚", calories: 310, protein: 18, carbs: 12, fat: 22, fiber: 2, serving: "2 eggs in gravy", tags: ["Non-Veg", "High Protein"] },
  { id: "l14", name: "Sambar", category: "lunch", emoji: "🍲", calories: 140, protein: 6, carbs: 20, fat: 4, fiber: 4, serving: "1 bowl (200g)", tags: ["Vegetarian", "South Indian"] },
  { id: "l15", name: "Rasam", category: "lunch", emoji: "🍵", calories: 60, protein: 2, carbs: 10, fat: 1, fiber: 1, serving: "1 bowl (200g)", tags: ["Vegetarian", "Light"] },
  { id: "l16", name: "Dal Tadka", category: "lunch", emoji: "🍛", calories: 200, protein: 10, carbs: 28, fat: 6, fiber: 5, serving: "1 bowl (200g)", tags: ["Vegetarian", "Protein"] },
  { id: "l17", name: "Kadhi Pakora", category: "lunch", emoji: "🍛", calories: 240, protein: 8, carbs: 22, fat: 14, fiber: 2, serving: "1 bowl (200g)", tags: ["Vegetarian", "North Indian"] },
  { id: "l18", name: "Bhindi Masala", category: "lunch", emoji: "🥒", calories: 160, protein: 4, carbs: 16, fat: 9, fiber: 4, serving: "1 bowl (200g)", tags: ["Vegetarian", "Low Cal"] },
  { id: "l19", name: "Tandoori Chicken (2 pcs)", category: "dinner", emoji: "🍗", calories: 340, protein: 36, carbs: 6, fat: 18, fiber: 1, serving: "2 pcs (200g)", tags: ["Non-Veg", "High Protein", "Grilled"] },
  { id: "l20", name: "Butter Chicken", category: "dinner", emoji: "🍗", calories: 440, protein: 30, carbs: 14, fat: 30, fiber: 2, serving: "1 bowl (250g)", tags: ["Non-Veg", "Rich"] },
  { id: "l21", name: "Naan (1 pc)", category: "lunch", emoji: "🫓", calories: 260, protein: 8, carbs: 45, fat: 5, fiber: 2, serving: "1 naan (80g)", tags: ["Vegetarian", "Bread"] },
  { id: "l22", name: "Mixed Veg Curry", category: "lunch", emoji: "🥗", calories: 150, protein: 5, carbs: 18, fat: 7, fiber: 5, serving: "1 bowl (200g)", tags: ["Vegetarian", "Healthy"] },

  // ========== SNACKS ==========
  { id: "s1", name: "Samosa (1 pc)", category: "snack", emoji: "🥟", calories: 260, protein: 4, carbs: 28, fat: 15, fiber: 2, serving: "1 pc (80g)", tags: ["Vegetarian", "Fried"] },
  { id: "s2", name: "Vada Pav", category: "snack", emoji: "🍔", calories: 350, protein: 7, carbs: 42, fat: 17, fiber: 3, serving: "1 pc (150g)", tags: ["Vegetarian", "Street Food"] },
  { id: "s3", name: "Pav Bhaji", category: "snack", emoji: "🍛", calories: 400, protein: 10, carbs: 48, fat: 18, fiber: 5, serving: "1 plate (250g)", tags: ["Vegetarian", "Street Food"] },
  { id: "s4", name: "Bhel Puri", category: "snack", emoji: "🥗", calories: 180, protein: 4, carbs: 32, fat: 5, fiber: 2, serving: "1 bowl (150g)", tags: ["Vegetarian", "Light"] },
  { id: "s5", name: "Paneer Tikka (4 pcs)", category: "snack", emoji: "🧀", calories: 280, protein: 18, carbs: 8, fat: 20, fiber: 1, serving: "4 pcs (120g)", tags: ["Vegetarian", "Grilled", "High Protein"] },
  { id: "s6", name: "Kachori (1 pc)", category: "snack", emoji: "🥟", calories: 220, protein: 4, carbs: 24, fat: 12, fiber: 2, serving: "1 pc (60g)", tags: ["Vegetarian", "Fried"] },
  { id: "s7", name: "Dhokla (4 pcs)", category: "snack", emoji: "🍰", calories: 160, protein: 6, carbs: 26, fat: 4, fiber: 2, serving: "4 pcs (100g)", tags: ["Vegetarian", "Steamed"] },
  { id: "s8", name: "Pakora/Bhajiya (5 pcs)", category: "snack", emoji: "🧆", calories: 240, protein: 5, carbs: 22, fat: 15, fiber: 2, serving: "5 pcs (100g)", tags: ["Vegetarian", "Fried"] },
  { id: "s9", name: "Sprout Chaat", category: "snack", emoji: "🌱", calories: 150, protein: 10, carbs: 22, fat: 3, fiber: 5, serving: "1 bowl (150g)", tags: ["Vegetarian", "Healthy"] },
  { id: "s10", name: "Roasted Makhana", category: "snack", emoji: "🫘", calories: 110, protein: 4, carbs: 18, fat: 2, fiber: 2, serving: "1 cup (30g)", tags: ["Vegetarian", "Low Cal"] },
  { id: "s11", name: "Peanut Chikki", category: "snack", emoji: "🥜", calories: 180, protein: 6, carbs: 22, fat: 8, fiber: 2, serving: "1 pc (40g)", tags: ["Vegetarian", "Energy"] },
  { id: "s12", name: "Egg Omelette", category: "snack", emoji: "🍳", calories: 180, protein: 12, carbs: 2, fat: 14, fiber: 0, serving: "2 eggs", tags: ["Non-Veg", "High Protein"] },

  // ========== FRUITS (RAW) ==========
  { id: "f1", name: "Apple", category: "fruit", emoji: "🍎", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, serving: "100g raw", tags: ["Raw", "Fruit"] },
  { id: "f2", name: "Banana", category: "fruit", emoji: "🍌", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving: "100g raw (1 medium)", tags: ["Raw", "Fruit", "Energy"] },
  { id: "f3", name: "Mango (Alphonso)", category: "fruit", emoji: "🥭", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, serving: "100g raw", tags: ["Raw", "Seasonal"] },
  { id: "f4", name: "Papaya", category: "fruit", emoji: "🍈", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, serving: "100g raw", tags: ["Raw", "Digestive"] },
  { id: "f5", name: "Guava (Amrood)", category: "fruit", emoji: "🍐", calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, serving: "100g raw", tags: ["Raw", "Vitamin C"] },
  { id: "f6", name: "Pomegranate (Anaar)", category: "fruit", emoji: "🫐", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, serving: "100g raw", tags: ["Raw", "Antioxidant"] },
  { id: "f7", name: "Orange (Santra)", category: "fruit", emoji: "🍊", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, serving: "100g raw", tags: ["Raw", "Vitamin C"] },
  { id: "f8", name: "Watermelon (Tarbooz)", category: "fruit", emoji: "🍉", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, serving: "100g raw", tags: ["Raw", "Hydrating"] },
  { id: "f9", name: "Grapes (Angoor)", category: "fruit", emoji: "🍇", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, serving: "100g raw", tags: ["Raw", "Fruit"] },
  { id: "f10", name: "Chikoo (Sapodilla)", category: "fruit", emoji: "🥝", calories: 83, protein: 0.4, carbs: 20, fat: 1.1, fiber: 5.3, serving: "100g raw", tags: ["Raw", "Energy"] },
  { id: "f11", name: "Pineapple (Ananas)", category: "fruit", emoji: "🍍", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, serving: "100g raw", tags: ["Raw", "Digestive"] },
  { id: "f12", name: "Lychee", category: "fruit", emoji: "🫐", calories: 66, protein: 0.8, carbs: 17, fat: 0.4, fiber: 1.3, serving: "100g raw", tags: ["Raw", "Seasonal"] },
  { id: "f13", name: "Coconut (Fresh)", category: "fruit", emoji: "🥥", calories: 354, protein: 3.3, carbs: 15, fat: 33, fiber: 9, serving: "100g raw", tags: ["Raw", "High Fat"] },
  { id: "f14", name: "Strawberry", category: "fruit", emoji: "🍓", calories: 33, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, serving: "100g raw", tags: ["Raw", "Low Cal"] },
  { id: "f15", name: "Kiwi", category: "fruit", emoji: "🥝", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, serving: "100g raw", tags: ["Raw", "Vitamin C"] },
  { id: "f16", name: "Jackfruit (Kathal)", category: "fruit", emoji: "🍈", calories: 95, protein: 1.7, carbs: 23, fat: 0.6, fiber: 1.5, serving: "100g raw", tags: ["Raw", "Seasonal"] },

  // ========== VEGETABLES (RAW) ==========
  { id: "v1", name: "Tomato (Tamatar)", category: "vegetable", emoji: "🍅", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, serving: "100g raw", tags: ["Raw", "Vegetable"] },
  { id: "v2", name: "Onion (Pyaaz)", category: "vegetable", emoji: "🧅", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, serving: "100g raw", tags: ["Raw", "Vegetable"] },
  { id: "v3", name: "Potato (Aloo)", category: "vegetable", emoji: "🥔", calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, serving: "100g raw", tags: ["Raw", "Starchy"] },
  { id: "v4", name: "Carrot (Gajar)", category: "vegetable", emoji: "🥕", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, serving: "100g raw", tags: ["Raw", "Vitamin A"] },
  { id: "v5", name: "Spinach (Palak)", category: "vegetable", emoji: "🥬", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, serving: "100g raw", tags: ["Raw", "Iron Rich"] },
  { id: "v6", name: "Cauliflower (Gobi)", category: "vegetable", emoji: "🥦", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, serving: "100g raw", tags: ["Raw", "Low Cal"] },
  { id: "v7", name: "Cabbage (Patta Gobi)", category: "vegetable", emoji: "🥬", calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, serving: "100g raw", tags: ["Raw", "Low Cal"] },
  { id: "v8", name: "Brinjal (Baingan)", category: "vegetable", emoji: "🍆", calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, serving: "100g raw", tags: ["Raw", "Vegetable"] },
  { id: "v9", name: "Cucumber (Kheera)", category: "vegetable", emoji: "🥒", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, serving: "100g raw", tags: ["Raw", "Hydrating"] },
  { id: "v10", name: "Bottle Gourd (Lauki)", category: "vegetable", emoji: "🥒", calories: 14, protein: 0.6, carbs: 3.4, fat: 0, fiber: 0.5, serving: "100g raw", tags: ["Raw", "Low Cal"] },
  { id: "v11", name: "Bitter Gourd (Karela)", category: "vegetable", emoji: "🥒", calories: 17, protein: 1, carbs: 3.7, fat: 0.2, fiber: 2.8, serving: "100g raw", tags: ["Raw", "Diabetic Friendly"] },
  { id: "v12", name: "Okra (Bhindi)", category: "vegetable", emoji: "🌶️", calories: 33, protein: 1.9, carbs: 7, fat: 0.2, fiber: 3.2, serving: "100g raw", tags: ["Raw", "Fiber Rich"] },
  { id: "v13", name: "Green Peas (Matar)", category: "vegetable", emoji: "🫘", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, serving: "100g raw", tags: ["Raw", "Protein"] },
  { id: "v14", name: "Beetroot (Chukandar)", category: "vegetable", emoji: "🫐", calories: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8, serving: "100g raw", tags: ["Raw", "Iron Rich"] },
  { id: "v15", name: "Sweet Potato (Shakarkandi)", category: "vegetable", emoji: "🍠", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, serving: "100g raw", tags: ["Raw", "Complex Carb"] },
  { id: "v16", name: "Capsicum (Shimla Mirch)", category: "vegetable", emoji: "🫑", calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, serving: "100g raw", tags: ["Raw", "Vitamin C"] },
  { id: "v17", name: "Drumstick (Sahjan)", category: "vegetable", emoji: "🌿", calories: 37, protein: 2.1, carbs: 8.5, fat: 0.2, fiber: 3.2, serving: "100g raw", tags: ["Raw", "Calcium"] },
  { id: "v18", name: "Radish (Mooli)", category: "vegetable", emoji: "🫐", calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6, serving: "100g raw", tags: ["Raw", "Digestive"] },

  // ========== DAIRY ==========
  { id: "d1", name: "Milk (Full Cream)", category: "dairy", emoji: "🥛", calories: 130, protein: 7, carbs: 10, fat: 7, fiber: 0, serving: "1 glass (200ml)", tags: ["Dairy", "Calcium"] },
  { id: "d2", name: "Curd / Dahi", category: "dairy", emoji: "🥛", calories: 98, protein: 5, carbs: 8, fat: 5, fiber: 0, serving: "1 bowl (200g)", tags: ["Dairy", "Probiotic"] },
  { id: "d3", name: "Paneer (Raw)", category: "dairy", emoji: "🧀", calories: 265, protein: 18, carbs: 1.2, fat: 21, fiber: 0, serving: "100g raw", tags: ["Dairy", "High Protein"] },
  { id: "d4", name: "Buttermilk (Chaas)", category: "dairy", emoji: "🥛", calories: 45, protein: 2, carbs: 5, fat: 2, fiber: 0, serving: "1 glass (200ml)", tags: ["Dairy", "Digestive", "Low Cal"] },
  { id: "d5", name: "Lassi (Sweet)", category: "dairy", emoji: "🥛", calories: 180, protein: 5, carbs: 28, fat: 5, fiber: 0, serving: "1 glass (250ml)", tags: ["Dairy", "Sweet"] },
  { id: "d6", name: "Ghee", category: "dairy", emoji: "🧈", calories: 112, protein: 0, carbs: 0, fat: 12, fiber: 0, serving: "1 tbsp (15g)", tags: ["Dairy", "Pure Fat"] },

  // ========== GRAINS & PULSES ==========
  { id: "g1", name: "Basmati Rice (Cooked)", category: "grain", emoji: "🍚", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, serving: "100g cooked", tags: ["Grain", "Staple"] },
  { id: "g2", name: "Brown Rice (Cooked)", category: "grain", emoji: "🍚", calories: 112, protein: 2.3, carbs: 24, fat: 0.8, fiber: 1.8, serving: "100g cooked", tags: ["Grain", "Healthy"] },
  { id: "g3", name: "Moong Dal (Cooked)", category: "grain", emoji: "🫘", calories: 106, protein: 7, carbs: 19, fat: 0.4, fiber: 4, serving: "100g cooked", tags: ["Pulse", "Light"] },
  { id: "g4", name: "Chana Dal (Cooked)", category: "grain", emoji: "🫘", calories: 125, protein: 8, carbs: 21, fat: 1, fiber: 5, serving: "100g cooked", tags: ["Pulse", "High Fiber"] },
  { id: "g5", name: "Toor/Arhar Dal (Cooked)", category: "grain", emoji: "🫘", calories: 118, protein: 7.5, carbs: 21, fat: 0.4, fiber: 3, serving: "100g cooked", tags: ["Pulse", "Staple"] },
  { id: "g6", name: "Whole Wheat Flour (Atta)", category: "grain", emoji: "🌾", calories: 340, protein: 12, carbs: 72, fat: 2, fiber: 11, serving: "100g raw", tags: ["Grain", "Staple"] },
  { id: "g7", name: "Bajra (Pearl Millet)", category: "grain", emoji: "🌾", calories: 361, protein: 12, carbs: 67, fat: 5, fiber: 1.2, serving: "100g raw", tags: ["Millet", "Traditional"] },
  { id: "g8", name: "Ragi (Finger Millet)", category: "grain", emoji: "🌾", calories: 328, protein: 7, carbs: 72, fat: 1.3, fiber: 3.6, serving: "100g raw", tags: ["Millet", "Calcium Rich"] },
  { id: "g9", name: "Jowar (Sorghum)", category: "grain", emoji: "🌾", calories: 349, protein: 10, carbs: 73, fat: 1.7, fiber: 1.6, serving: "100g raw", tags: ["Millet", "Gluten-Free"] },

  // ========== BEVERAGES ==========
  { id: "bv1", name: "Masala Chai", category: "beverage", emoji: "☕", calories: 95, protein: 3, carbs: 12, fat: 4, fiber: 0, serving: "1 cup (150ml)", tags: ["Beverage", "Traditional"] },
  { id: "bv2", name: "Black Coffee", category: "beverage", emoji: "☕", calories: 5, protein: 0.3, carbs: 1, fat: 0, fiber: 0, serving: "1 cup (150ml)", tags: ["Beverage", "Zero Cal"] },
  { id: "bv3", name: "Nimbu Pani", category: "beverage", emoji: "🍋", calories: 45, protein: 0, carbs: 12, fat: 0, fiber: 0, serving: "1 glass (250ml)", tags: ["Beverage", "Hydrating"] },
  { id: "bv4", name: "Coconut Water", category: "beverage", emoji: "🥥", calories: 46, protein: 1.7, carbs: 9, fat: 0.5, fiber: 2.6, serving: "1 glass (240ml)", tags: ["Beverage", "Electrolyte"] },
  { id: "bv5", name: "Mango Lassi", category: "beverage", emoji: "🥭", calories: 210, protein: 5, carbs: 38, fat: 5, fiber: 1, serving: "1 glass (250ml)", tags: ["Beverage", "Sweet"] },
  { id: "bv6", name: "Green Tea", category: "beverage", emoji: "🍵", calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, serving: "1 cup (150ml)", tags: ["Beverage", "Antioxidant"] },
  { id: "bv7", name: "Protein Shake (Whey)", category: "beverage", emoji: "🥤", calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, serving: "1 scoop (30g)", tags: ["Supplement", "Post-Workout"] },
];

// Pre-built meal sets for default diary display
export interface MealEntry {
  food: FoodItem;
  quantity: number;
  customServing?: string;
}

export interface MealSlot {
  name: string;
  emoji: string;
  time: string;
  entries: MealEntry[];
}

export const getDefaultMeals = (): MealSlot[] => {
  const find = (id: string) => indianFoods.find(f => f.id === id)!;
  return [
    {
      name: "BREAKFAST",
      emoji: "🌅",
      time: "8:00 AM",
      entries: [
        { food: find("b6"), quantity: 1, customServing: "1 paratha" },
        { food: find("d2"), quantity: 1, customServing: "1 bowl" },
        { food: find("bv1"), quantity: 1, customServing: "1 cup" },
      ],
    },
    {
      name: "LUNCH",
      emoji: "☀️",
      time: "1:00 PM",
      entries: [
        { food: find("l1"), quantity: 1, customServing: "1 plate" },
        { food: find("l6"), quantity: 2, customServing: "2 rotis" },
        { food: find("l11"), quantity: 1, customServing: "1 bowl" },
      ],
    },
    {
      name: "SNACK",
      emoji: "🍵",
      time: "5:00 PM",
      entries: [
        { food: find("s9"), quantity: 1, customServing: "1 bowl" },
        { food: find("bv1"), quantity: 1, customServing: "1 cup" },
      ],
    },
    {
      name: "DINNER",
      emoji: "🌙",
      time: "8:30 PM",
      entries: [
        { food: find("l3"), quantity: 1, customServing: "1 bowl" },
        { food: find("l6"), quantity: 2, customServing: "2 rotis" },
        { food: find("d4"), quantity: 1, customServing: "1 glass" },
      ],
    },
  ];
};
