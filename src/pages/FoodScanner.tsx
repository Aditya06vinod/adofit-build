import {
  ChevronLeft, Camera, Upload, Zap, Flame, Droplets,
  AlertTriangle, CheckCircle, XCircle, RotateCcw, Plus,
  Info, Star, Sparkles, ScanLine, Loader2, RefreshCw, X
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NutritionResult {
  foodName: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  fatType: "good" | "bad" | "mixed";
  goodFats: string[];
  badFats: string[];
  sugarLoad: "low" | "moderate" | "high";
  healthScore: number; // 0-100
  verdict: string;
  tips: string[];
  servingSize: string;
  isProcessed: boolean;
}

// ─── Food Database ───────────────────────────────────────────────────────────

const foodDatabase: Record<string, NutritionResult> = {
  // Healthy foods
  salad: {
    foodName: "Garden Salad", emoji: "🥗", calories: 87, protein: 3, carbs: 12, fat: 4, fiber: 3.2, sugar: 5, sodium: 120,
    fatType: "good", goodFats: ["Olive oil (monounsaturated)"], badFats: [],
    sugarLoad: "low", healthScore: 91, verdict: "Excellent choice!",
    tips: ["Great source of vitamins & antioxidants", "Add protein like chicken or eggs for a complete meal", "Olive oil dressing boosts nutrient absorption"],
    servingSize: "1 bowl (200g)", isProcessed: false,
  },
  avocado: {
    foodName: "Avocado", emoji: "🥑", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7,
    fatType: "good", goodFats: ["Oleic acid (monounsaturated)", "Omega-9"],  badFats: [],
    sugarLoad: "low", healthScore: 95, verdict: "Superfood! Highly nutritious.",
    tips: ["Rich in heart-healthy monounsaturated fats", "High potassium — great for blood pressure", "Eat with other foods to enhance fat-soluble vitamin absorption"],
    servingSize: "1 medium (150g)", isProcessed: false,
  },
  salmon: {
    foodName: "Grilled Salmon", emoji: "🐟", calories: 208, protein: 28, carbs: 0, fat: 10, fiber: 0, sugar: 0, sodium: 75,
    fatType: "good", goodFats: ["Omega-3 EPA", "Omega-3 DHA", "Omega-6"],  badFats: [],
    sugarLoad: "low", healthScore: 97, verdict: "Outstanding! One of the healthiest proteins.",
    tips: ["Exceptionally rich in Omega-3 fatty acids", "Supports brain health and reduces inflammation", "Complete protein with all essential amino acids"],
    servingSize: "100g fillet", isProcessed: false,
  },
  chicken: {
    foodName: "Grilled Chicken Breast", emoji: "🍗", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74,
    fatType: "good", goodFats: ["Lean unsaturated fat"],  badFats: [],
    sugarLoad: "low", healthScore: 93, verdict: "Excellent lean protein source!",
    tips: ["Very high protein, very low fat — ideal for muscle building", "Remove skin to reduce saturated fat further", "Pair with vegetables for a balanced meal"],
    servingSize: "100g", isProcessed: false,
  },
  egg: {
    foodName: "Whole Egg", emoji: "🍳", calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sugar: 0.6, sodium: 142,
    fatType: "mixed", goodFats: ["Omega-3 (in yolk)", "Lecithin"],  badFats: ["Saturated fat (small amount)"],
    sugarLoad: "low", healthScore: 82, verdict: "Nutritious and balanced.",
    tips: ["Complete protein with all essential amino acids", "Yolk contains choline, vital for brain function", "Limit to 1-2 eggs/day if you have high cholesterol"],
    servingSize: "2 large eggs (100g)", isProcessed: false,
  },
  apple: {
    foodName: "Apple", emoji: "🍎", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1,
    fatType: "good", goodFats: [],  badFats: [],
    sugarLoad: "moderate", healthScore: 88, verdict: "Great natural snack!",
    tips: ["High fiber helps slow sugar absorption", "Rich in antioxidants like quercetin", "Eat with skin for maximum fiber and nutrients"],
    servingSize: "1 medium (182g)", isProcessed: false,
  },
  banana: {
    foodName: "Banana", emoji: "🍌", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1,
    fatType: "good", goodFats: [],  badFats: [],
    sugarLoad: "moderate", healthScore: 80, verdict: "Good energy source, best pre-workout.",
    tips: ["Great pre-workout energy boost", "Rich in potassium for muscle function", "Riper bananas = higher sugar; unripe = more resistant starch"],
    servingSize: "1 medium (118g)", isProcessed: false,
  },
  oatmeal: {
    foodName: "Oatmeal / Porridge", emoji: "🥣", calories: 158, protein: 5, carbs: 27, fat: 3, fiber: 4, sugar: 0.6, sodium: 115,
    fatType: "good", goodFats: ["Beta-glucan (soluble fiber)"], badFats: [],
    sugarLoad: "low", healthScore: 90, verdict: "Excellent breakfast choice!",
    tips: ["Beta-glucan fiber lowers LDL cholesterol", "Slow-digesting carbs keep you full longer", "Add nuts or fruits for extra nutrition"],
    servingSize: "1 cup cooked (234g)", isProcessed: false,
  },
  broccoli: {
    foodName: "Broccoli", emoji: "🥦", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33,
    fatType: "good", goodFats: [], badFats: [],
    sugarLoad: "low", healthScore: 98, verdict: "Nutrition powerhouse!",
    tips: ["Loaded with Vitamin C and K", "Contains sulforaphane, a powerful anti-cancer compound", "Lightly steam to retain maximum nutrients"],
    servingSize: "1 cup (91g)", isProcessed: false,
  },
  // Moderate foods
  rice: {
    foodName: "White Rice", emoji: "🍚", calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0, sodium: 2,
    fatType: "good", goodFats: [], badFats: [],
    sugarLoad: "high", healthScore: 55, verdict: "High GI — control portions.",
    tips: ["High glycemic index causes rapid blood sugar spikes", "Switch to brown rice for 3x more fiber", "Pair with protein and vegetables to slow sugar absorption"],
    servingSize: "1 cup cooked (186g)", isProcessed: false,
  },
  bread: {
    foodName: "White Bread", emoji: "🍞", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.7, sodium: 477,
    fatType: "mixed", goodFats: [], badFats: ["Trans fat traces"],
    sugarLoad: "high", healthScore: 40, verdict: "Refined carbs — limit intake.",
    tips: ["Refined flour strips away most nutrients", "Switch to whole-grain bread for 3x more fiber", "High sodium content — watch daily intake"],
    servingSize: "2 slices (56g)", isProcessed: true,
  },
  pasta: {
    foodName: "Pasta", emoji: "🍝", calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, sugar: 0.6, sodium: 1,
    fatType: "good", goodFats: [], badFats: [],
    sugarLoad: "moderate", healthScore: 58, verdict: "Moderate — choose whole wheat.",
    tips: ["Al dente pasta has a lower glycemic index", "Use tomato-based sauces instead of creamy ones", "Whole wheat pasta doubles the fiber content"],
    servingSize: "1 cup cooked (140g)", isProcessed: false,
  },
  // Unhealthy foods
  pizza: {
    foodName: "Pizza", emoji: "🍕", calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2.7, sugar: 3.6, sodium: 640,
    fatType: "bad", goodFats: [], badFats: ["Saturated fat (from cheese)", "Trans fat (from processed meat)"],
    sugarLoad: "moderate", healthScore: 32, verdict: "High in sodium and saturated fat!",
    tips: ["One slice can have 30-40% of daily sodium limit", "Request thin crust and extra vegetables", "Limit to 1-2 slices and balance with a salad"],
    servingSize: "1 slice (107g)", isProcessed: true,
  },
  burger: {
    foodName: "Beef Burger", emoji: "🍔", calories: 354, protein: 20, carbs: 29, fat: 17, fiber: 1.3, sugar: 5, sodium: 497,
    fatType: "bad", goodFats: [], badFats: ["Saturated fat", "Trans fat (from patty)"],
    sugarLoad: "moderate", healthScore: 28, verdict: "High in saturated fat and calories!",
    tips: ["Saturated fat raises LDL 'bad' cholesterol", "Choose grilled over fried, skip the cheese", "Add lettuce and tomato; skip the mayo"],
    servingSize: "1 burger (150g)", isProcessed: true,
  },
  fries: {
    foodName: "French Fries", emoji: "🍟", calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, sodium: 282,
    fatType: "bad", goodFats: [], badFats: ["Trans fat (from deep frying)", "Oxidized vegetable oils"],
    sugarLoad: "high", healthScore: 18, verdict: "Avoid! High in trans fats.",
    tips: ["Deep-frying creates harmful trans fats and acrylamide", "Air-fry or bake sweet potatoes as a healthy swap", "The crispy texture comes from oxidized inflammatory oils"],
    servingSize: "Medium serving (117g)", isProcessed: true,
  },
  chips: {
    foodName: "Potato Chips", emoji: "🥔", calories: 536, protein: 7, carbs: 53, fat: 35, fiber: 4.8, sugar: 0.4, sodium: 490,
    fatType: "bad", goodFats: [], badFats: ["Omega-6 vegetable oils", "Trans fat traces"],
    sugarLoad: "moderate", healthScore: 12, verdict: "Ultra-processed — avoid!",
    tips: ["Among the most calorie-dense processed foods", "High in acrylamide, a potential carcinogen from high-heat cooking", "Try air-popped popcorn or veggie sticks as a swap"],
    servingSize: "1 small bag (43g)", isProcessed: true,
  },
  soda: {
    foodName: "Cola / Soda", emoji: "🥤", calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, sugar: 39, sodium: 45,
    fatType: "good", goodFats: [], badFats: [],
    sugarLoad: "high", healthScore: 5, verdict: "Liquid sugar — very harmful!",
    tips: ["39g sugar = about 10 teaspoons in one can!", "Zero nutritional benefit, all empty calories", "Switch to sparkling water with lemon or unsweetened tea"],
    servingSize: "1 can (355ml)", isProcessed: true,
  },
  donut: {
    foodName: "Glazed Donut", emoji: "🍩", calories: 253, protein: 4, carbs: 31, fat: 14, fiber: 0.7, sugar: 14, sodium: 250,
    fatType: "bad", goodFats: [], badFats: ["Trans fat", "Saturated fat"],
    sugarLoad: "high", healthScore: 10, verdict: "High sugar + trans fat — avoid!",
    tips: ["Contains both refined sugar and trans fats — double harmful", "Causes rapid blood sugar spike followed by crash", "Satisfy sweet cravings with dark chocolate or fruit instead"],
    servingSize: "1 glazed donut (60g)", isProcessed: true,
  },
  chocolate: {
    foodName: "Dark Chocolate", emoji: "🍫", calories: 170, protein: 2, carbs: 13, fat: 12, fiber: 3, sugar: 7, sodium: 20,
    fatType: "good", goodFats: ["Stearic acid (neutral)", "Oleic acid (monounsaturated)"],  badFats: [],
    sugarLoad: "moderate", healthScore: 73, verdict: "Good in moderation (70%+ cocoa)!",
    tips: ["Rich in antioxidant flavonoids that benefit heart health", "Stearic acid in cocoa is a neutral saturated fat", "Choose 70%+ cocoa for maximum health benefits"],
    servingSize: "1 square (30g)", isProcessed: false,
  },
  milk: {
    foodName: "Whole Milk", emoji: "🥛", calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12, sodium: 105,
    fatType: "mixed", goodFats: ["CLA (conjugated linoleic acid)"], badFats: ["Saturated fat"],
    sugarLoad: "moderate", healthScore: 68, verdict: "Nutritious — choose low-fat if needed.",
    tips: ["Good source of calcium and Vitamin D", "Natural sugars (lactose) are less harmful than added sugar", "Switch to low-fat or plant-based alternatives if managing weight"],
    servingSize: "1 cup (244ml)", isProcessed: false,
  },
  nuts: {
    foodName: "Mixed Nuts", emoji: "🥜", calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 8, sugar: 4, sodium: 2,
    fatType: "good", goodFats: ["Omega-3 ALA", "Monounsaturated fats", "Polyunsaturated fats"], badFats: [],
    sugarLoad: "low", healthScore: 88, verdict: "Healthy fat powerhouse!",
    tips: ["Despite high calories, nut eaters tend to weigh less", "Rich in Vitamin E, magnesium, and selenium", "Limit to a small handful (28g) — very calorie dense"],
    servingSize: "1oz / 28g", isProcessed: false,
  },
  yogurt: {
    foodName: "Greek Yogurt", emoji: "🍦", calories: 97, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 4, sodium: 65,
    fatType: "good", goodFats: [], badFats: [],
    sugarLoad: "low", healthScore: 89, verdict: "Excellent probiotic protein source!",
    tips: ["Probiotics support gut microbiome health", "Twice the protein of regular yogurt", "Choose plain/unsweetened versions to avoid added sugar"],
    servingSize: "1 cup (200g)", isProcessed: false,
  },
};

// ─── AI Analyzer ─────────────────────────────────────────────────────────────

const AI_URL_STABLE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const callGeminiVision = async (text: string, base64Data?: string, apiKey?: string): Promise<NutritionResult> => {
  const currentApiKey = apiKey || localStorage.getItem("ado-gemini-api-key") || "";

  const systemContext = `You are an expert Indian Diet and Nutrition AI.
  Look at the provided image or food name and provide a detailed nutritional analysis.
  If an image is provided, identify the primary food item in the image.
  Identify the food and estimate its nutritional content accurately based on typical portion sizes.
  Respond ONLY with a valid JSON strictly matching this schema:
  {"foodName": "Descriptive Name", "emoji": "🍽️", "calories": 250, "protein": 10, "carbs": 25, "fat": 8, "fiber": 3, "sugar": 5, "sodium": 200, "fatType": "good"|"bad"|"mixed", "goodFats": ["details..."], "badFats": ["details..."], "sugarLoad": "low"|"moderate"|"high", "healthScore": 85, "verdict": "Keep it up!", "tips": ["Tip 1", "Tip 2"], "servingSize": "1 serving", "isProcessed": false}`;

  const parts: any[] = [{ text: systemContext + (text ? `\n\nContext/Query: ${text}` : "") }];
  if (base64Data) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }

  const response = await fetch(`${AI_URL_STABLE}?key=${currentApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Gemini API Error Detail:", resData);
    throw new Error(resData.error?.message || `API Error: ${response.status}`);
  }

  if (!resData.candidates || resData.candidates.length === 0) {
    throw new Error("AI could not analyze this image. Try a clearer angle.");
  }

  const textResponse = resData.candidates[0].content?.parts?.[0]?.text?.trim() || "";
  if (!textResponse) throw new Error("Empty response from AI.");

  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid nutritional data.");

  return JSON.parse(jsonMatch[0]);
};

const analyzeFood = (input: string, isUpload: boolean = false): NutritionResult => {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(foodDatabase)) {
    if (lower.includes(key)) return data;
  }
  // Intelligent fallback based on keywords
  if (lower.includes("fried") || lower.includes("deep")) {
    return { ...foodDatabase.fries, foodName: input, emoji: "🍳" };
  }
  if (lower.includes("juice") || lower.includes("drink") || lower.includes("smoothie")) {
    return { ...foodDatabase.banana, foodName: input, emoji: "🧃", calories: 120, sugar: 22, sugarLoad: "high", healthScore: 45 };
  }
  if (lower.includes("cake") || lower.includes("sweet") || lower.includes("candy") || lower.includes("dessert")) {
    return { ...foodDatabase.donut, foodName: input, emoji: "🧁" };
  }
  if (lower.includes("meat") || lower.includes("beef") || lower.includes("pork") || lower.includes("steak")) {
    return { ...foodDatabase.burger, foodName: input, emoji: "🥩" };
  }
  if (lower.includes("vegetable") || lower.includes("veggie") || lower.includes("veg")) {
    return { ...foodDatabase.broccoli, foodName: input, emoji: "🥦" };
  }
  if (lower.includes("fruit") || lower.includes("berry")) {
    return { ...foodDatabase.apple, foodName: input, emoji: "🍓" };
  }
  // Generic unknown food fallback
  const isGeneric = input.toLowerCase().includes("plate") || input.toLowerCase().includes("image") || input.toLowerCase().includes("photo") || input.length < 3;
  const finalName = isGeneric ? (isUpload ? "Captured Plate" : "Unknown Food") : input;

  return {
    foodName: finalName, emoji: "🍽️",
    calories: 220, protein: 8, carbs: 28, fat: 9, fiber: 2, sugar: 8, sodium: 350,
    fatType: "mixed", goodFats: ["Some unsaturated fats"], badFats: ["Some saturated fats"],
    sugarLoad: "moderate", healthScore: 50, verdict: "AI Offline — using estimated values.",
    tips: ["AI was unable to process this image - showing average estimates", "Try typing the food name manually for better accuracy", "Check your API key in Settings if this persists"],
    servingSize: "1 serving (100g)", isProcessed: false,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "from-emerald-500/20 to-emerald-500/5";
  if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
  if (score >= 40) return "from-orange-500/20 to-orange-500/5";
  return "from-red-500/20 to-red-500/5";
};

const getSugarBadge = (load: string) => {
  if (load === "low") return { label: "Low Sugar Load", bg: "bg-emerald-500/20 text-emerald-400", icon: "✅" };
  if (load === "moderate") return { label: "Moderate Sugar Load", bg: "bg-yellow-500/20 text-yellow-400", icon: "⚠️" };
  return { label: "High Sugar Load", bg: "bg-red-500/20 text-red-400", icon: "🚨" };
};

const getFatBadge = (type: string) => {
  if (type === "good") return { label: "Healthy Fats ✅", bg: "bg-emerald-500/20 text-emerald-400" };
  if (type === "mixed") return { label: "Mixed Fats ⚠️", bg: "bg-yellow-500/20 text-yellow-400" };
  return { label: "Unhealthy Fats ❌", bg: "bg-red-500/20 text-red-400" };
};

const quickScanFoods = [
  "Pizza", "Avocado", "Salmon", "Burger", "Greek Yogurt", "Oatmeal",
  "Dark Chocolate", "French Fries", "Broccoli", "Banana",
];

// ─── Component ───────────────────────────────────────────────────────────────

type ScanState = "idle" | "scanning" | "result";

interface FoodScannerProps {
  onClose?: () => void;
  onLog?: (kcal: number, name: string) => void;
}

const FoodScanner = ({ onClose, onLog }: FoodScannerProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [foodQuery, setFoodQuery] = useState("");
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const constraints = { video: { facingMode: facingMode }, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setImageUrl(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (state === "idle" && !imageUrl && !result) {
      startCamera();
    }
    return () => stopCamera();
  }, [state, imageUrl, result, facingMode]);

  const runScan = useCallback(async (query: string, imgUrl?: string, base64Data?: string) => {
    setState("scanning");
    setScanProgress(0);
    if (imgUrl) setImageUrl(imgUrl);

    let progress = 0;
    const interval = setInterval(() => {
        progress += (95 - progress) * 0.1;
        setScanProgress(progress);
    }, 300);

    try {
        const finalResult = await callGeminiVision(query, base64Data);
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
            setResult(finalResult);
            setState("result");
            stopCamera();
        }, 300);
    } catch (err: any) {
        clearInterval(interval);
        console.error(err);
        toast({ title: "AI Analysis Error", description: err.message || "Falling back to local database.", variant: "destructive" });
        setResult(analyzeFood(query, !!imgUrl));
        setState("result");
        stopCamera();
    }
  }, [toast]);

  const handleCapture = async () => {
    if (!videoRef.current || isCameraActive === false) return;

    const canvas = document.createElement("canvas");
    canvas.width = 720;
    const aspect = videoRef.current.videoHeight / videoRef.current.videoWidth;
    canvas.height = Math.round(720 * aspect);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64Data = dataUrl.split(",")[1];

    runScan("Plate contents", dataUrl, base64Data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      // Use a generic term instead of filename to avoid confusing the AI
      runScan("Uploaded image", dataUrl, base64Data);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleManualScan = () => {
    if (!foodQuery.trim()) {
      toast({ title: "Enter food name", description: "Type what food you want to scan." });
      return;
    }
    runScan(foodQuery.trim());
  };

  const handleLogToTracker = () => {
    if (!result) return;

    const foodItem = {
      id: `scanned-${Date.now()}`,
      name: result.foodName,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      fiber: result.fiber || 0,
      emoji: result.emoji,
      serving: result.servingSize,
      category: "snack",
      tags: ["AI Scanned"]
    };

    localStorage.setItem("ado-pending-scanned-food", JSON.stringify(foodItem));
    toast({ title: "Food Identified! 🍲", description: `${result.foodName} ready to log.` });

    if (onLog) {
      onLog(result.calories, result.foodName);
      if (onClose) onClose();
    } else {
      navigate("/diet");
    }
  };

  const handleReset = () => {
    setState("idle");
    setImageUrl(null);
    setFoodQuery("");
    setResult(null);
    setScanProgress(0);
  };

  const scoreColor = result ? getScoreColor(result.healthScore) : "";
  const scoreBg = result ? getScoreBg(result.healthScore) : "";
  const sugarBadge = result ? getSugarBadge(result.sugarLoad) : null;
  const fatBadge = result ? getFatBadge(result.fatType) : null;

  return (
    <MobileLayout hideNav>
      <div className="animate-fade-in px-4 pt-4 pb-28 min-h-screen bg-background text-foreground flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onClose ? onClose() : navigate(-1)} className="p-1 text-foreground transition-colors rounded-full z-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="text-base font-bold">Food AI Scanner</h1>
          </div>
          <div className="flex gap-2">
             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full bg-secondary/50 text-muted-foreground"
              >
                <Upload className="h-5 w-5" />
              </button>
          </div>
        </div>

        {/* ── IDLE STATE ──────────────────────────────────────────────────── */}
        {state === "idle" && (
          <div className="flex-1 flex flex-col gap-4">

            {/* Viewport Area */}
            <div className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden bg-black border border-border/30 shadow-2xl flex items-center justify-center mb-2">
               {isCameraActive ? (
                <>
                  <video ref={videoRef} playsInline muted autoPlay className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                  <button onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")} className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-6">
                  <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Initializing camera...</p>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="gym-gradient-card rounded-2xl p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Avocado, Pizza, Salmon..."
                  value={foodQuery}
                  onChange={e => setFoodQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleManualScan()}
                  className="flex-1 rounded-xl bg-secondary px-3 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleManualScan}
                  className="flex items-center gap-1.5 rounded-xl gym-gradient-orange px-4 py-2.5 text-xs font-bold text-primary-foreground active:scale-95 transition-transform"
                >
                  <Zap className="h-3.5 w-3.5" /> Scan
                </button>
              </div>
            </div>

            <button
              onClick={handleCapture}
              disabled={!isCameraActive}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="h-5 w-5" /> Click to Capture & Analyze
            </button>

            {/* Quick Scan Chips */}
            <div>
              <p className="text-[10px] font-bold mb-2 text-muted-foreground uppercase tracking-widest">Quick Identify</p>
              <div className="flex flex-wrap gap-1.5">
                {quickScanFoods.slice(0, 6).map(food => (
                  <button
                    key={food}
                    onClick={() => { setFoodQuery(food); runScan(food); }}
                    className="rounded-full bg-secondary/80 px-3 py-1 text-[10px] font-semibold transition-transform active:scale-95 border border-border/30"
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCANNING STATE ──────────────────────────────────────────────── */}
        {state === "scanning" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative h-64 w-64 overflow-hidden rounded-3xl border-2 border-primary shadow-2xl">
              {imageUrl ? (
                 <img src={imageUrl} alt="food" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center">
                   <ScanLine className="h-12 w-12 text-primary animate-pulse" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                 <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-white mb-1">
                      <span>Analyzing Plate...</span>
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                 </div>
              </div>
            </div>
            <div className="text-center space-y-2">
               <p className="text-sm font-bold animate-pulse text-primary">Gemini 1.5 Flash processing image...</p>
               <p className="text-xs text-muted-foreground">Extracting nutritional data & health metrics</p>
            </div>
          </div>
        )}

        {/* ── RESULT STATE ────────────────────────────────────────────────── */}
        {state === "result" && result && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">

            {/* Result Hero */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${scoreBg} p-5 border border-white/10`}>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-inner">
                  {result.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-black leading-tight">{result.foodName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{result.servingSize}</p>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl bg-black/40 px-3 py-1.5 border border-white/5">
                      <span className={`text-2xl font-black ${scoreColor}`}>{result.healthScore}</span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Health Score</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <p className={`text-xs font-bold ${scoreColor}`}>{result.verdict}</p>
                {result.isProcessed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400">
                    <AlertTriangle className="h-2.5 w-2.5" /> Ultra-Processed
                  </span>
                )}
              </div>
            </div>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="gym-gradient-card rounded-2xl p-4 flex flex-col items-center border border-border/50">
                <Flame className="h-5 w-5 text-orange-400 mb-1" />
                <p className="text-2xl font-black text-foreground">{result.calories}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Kcal</p>
              </div>
              <div className="gym-gradient-card rounded-2xl p-4 flex flex-col items-center border border-border/50">
                <Droplets className="h-5 w-5 text-blue-400 mb-1" />
                <p className="text-2xl font-black text-foreground">{result.sugar}g</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Sugar</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-3">
              <div className={`flex-1 rounded-2xl ${sugarBadge!.bg} p-3 text-center border border-white/5`}>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-80">Sugar Load</p>
                <p className="text-xs font-black">{sugarBadge!.label}</p>
              </div>
              <div className={`flex-1 rounded-2xl ${fatBadge!.bg} p-3 text-center border border-white/5`}>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-80">Fat Quality</p>
                <p className="text-xs font-black">{fatBadge!.label}</p>
              </div>
            </div>

            {/* Nutrition Panel */}
            <div className="gym-gradient-card rounded-2xl p-4 border border-border/50">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-primary" /> Macronutrients Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Protein", value: `${result.protein}g`, color: "bg-blue-500", pct: Math.min(100, result.protein * 2.5) },
                  { label: "Carbs", value: `${result.carbs}g`, color: "bg-emerald-500", pct: Math.min(100, result.carbs * 1.5) },
                  { label: "Fats", value: `${result.fat}g`, color: "bg-orange-500", pct: Math.min(100, result.fat * 2.5) },
                  { label: "Fiber", value: `${result.fiber}g`, color: "bg-purple-500", pct: Math.min(100, result.fiber * 8) },
                  { label: "Sodium", value: `${result.sodium}mg`, color: "bg-red-500", pct: Math.min(100, (result.sodium / 2300) * 100) },
                ].map(macro => (
                  <div key={macro.label} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-muted-foreground uppercase tracking-tighter">{macro.label}</span>
                       <span>{macro.value}</span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`absolute inset-y-0 left-0 rounded-full ${macro.color} transition-all duration-1000`} style={{ width: `${macro.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> AI Health Guidance
              </h3>
              <div className="space-y-2.5">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLogToTracker}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" /> Add to Diary
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-4 text-sm font-bold active:scale-95 transition-transform"
              >
                <RotateCcw className="h-4 w-4" /> Rescan
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default FoodScanner;
