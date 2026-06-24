import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Minus,
  Trash2,
  MoreVertical,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { indianFoods, getDefaultMeals, type FoodItem, type MealSlot } from "@/data/indianFoods";

const { width } = Dimensions.get("window");

const DietTracker = () => {
  const router = useRouter();
  const bottomSheetHeight = useWindowDimensions().height * 0.85;
  const [dayOffset, setDayOffset] = useState(0);
  const [meals, setMeals] = useState<MealSlot[]>(getDefaultMeals());
  const [showAddFood, setShowAddFood] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingEntry, setEditingEntry] = useState<{ mealIdx: number; entryIdx: number } | null>(null);

  const modalVisible = showAddFood !== null;
  const setModalVisible = useCallback((visible: boolean) => {
    if (!visible) {
      setShowAddFood(null);
    }
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [modalVisible, setModalVisible]);

  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if (type === "light") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === "medium") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const dayLabel = dayOffset === 0 ? "Today" : dayOffset === -1 ? "Yesterday" : dayOffset === 1 ? "Tomorrow" : (() => {
    const d = new Date(); d.setDate(d.getDate() + dayOffset); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  })();

  const totals = useMemo(() => {
    let eaten = 0, protein = 0, carbs = 0, fat = 0;
    meals.forEach(m => m.entries.forEach(e => {
      eaten += e.food.calories * e.quantity;
      protein += e.food.protein * e.quantity;
      carbs += e.food.carbs * e.quantity;
      fat += e.food.fat * e.quantity;
    }));
    return { eaten, protein, carbs, fat };
  }, [meals]);

  const dailyGoal = 2500; // Mock goal
  const burned = 420;
  const remaining = dailyGoal - totals.eaten + burned;
  const progress = Math.min(1, totals.eaten / dailyGoal);

  const filteredFoods = useMemo(() => {
    return indianFoods.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const addFoodToMeal = (mealIndex: number, food: FoodItem) => {
    triggerHaptic("medium");
    const updated = meals.map((m, i) => {
      if (i !== mealIndex) return m;
      const existing = m.entries.findIndex(e => e.food.id === food.id);
      if (existing >= 0) {
        const newEntries = [...m.entries];
        newEntries[existing] = { ...newEntries[existing], quantity: newEntries[existing].quantity + 1 };
        return { ...m, entries: newEntries };
      }
      return { ...m, entries: [...m.entries, { food, quantity: 1 }] };
    });
    setMeals(updated);
    setShowAddFood(null);
    setSearch("");
  };

  const updateQuantity = (mealIndex: number, entryIndex: number, delta: number) => {
    triggerHaptic("light");
    const updated = meals.map((m, i) => {
      if (i !== mealIndex) return m;
      const newEntries = [...m.entries];
      const newQty = newEntries[entryIndex].quantity + delta;
      if (newQty <= 0) {
        newEntries.splice(entryIndex, 1);
        setEditingEntry(null);
      } else {
        newEntries[entryIndex] = { ...newEntries[entryIndex], quantity: newQty };
      }
      return { ...m, entries: newEntries };
    });
    setMeals(updated);
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snack", label: "Snacks" },
    { id: "fruit", label: "Fruits" },
  ];

  const MacroBar = ({ label, value, target, color }: { label: string; value: number; target: number; color: string }) => (
    <View style={styles.macroBox}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroProgressBg}>
        <View style={[styles.macroProgressFill, { width: `${Math.min(100, (value/target)*100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>{Math.round(value)}/{target}g</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diary</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Day Navigator */}
        <View style={styles.dayNavigator}>
          <TouchableOpacity onPress={() => setDayOffset(dayOffset - 1)} style={styles.navBtn}>
            <ChevronLeft size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>{dayLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => setDayOffset(dayOffset + 1)} style={styles.navBtn}>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Calorie Card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <View>
              <Text style={styles.calorieCardTitle}>Calories Remaining</Text>
              <View style={styles.goalBadge}>
                <Text style={styles.goalBadgeText}>GOAL: {dailyGoal}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.remainingText}>{Math.max(0, remaining)}</Text>
              <Text style={styles.unitText}>kcal left</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totals.eaten}</Text>
              <Text style={styles.statLabel}>Eaten</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{burned}</Text>
              <Text style={styles.statLabel}>Burned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totals.eaten - burned}</Text>
              <Text style={styles.statLabel}>Net</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Macro Bars */}
        <View style={styles.macroRow}>
          <MacroBar label="Protein" value={totals.protein} target={150} color="#1C64F2" />
          <MacroBar label="Carbs" value={totals.carbs} target={300} color="#22C55E" />
          <MacroBar label="Fats" value={totals.fat} target={70} color="#F59E0B" />
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          {meals.map((meal, mIdx) => (
            <View key={mIdx} style={styles.mealBox}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <Text style={styles.mealKcal}>
                  {meal.entries.reduce((s, e) => s + e.food.calories * e.quantity, 0)} kcal
                </Text>
              </View>

              {meal.entries.map((entry, eIdx) => (
                <TouchableOpacity
                  key={eIdx}
                  style={styles.foodRow}
                  onPress={() => setEditingEntry(editingEntry?.mealIdx === mIdx && editingEntry?.entryIdx === eIdx ? null : { mealIdx: mIdx, entryIdx: eIdx })}
                >
                  <View style={styles.foodEmojiBox}>
                    <Text>{entry.food.emoji}</Text>
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{entry.food.name}</Text>
                    <Text style={styles.foodServing}>{entry.food.serving} x {entry.quantity}</Text>
                  </View>
                  <Text style={styles.foodKcal}>{entry.food.calories * entry.quantity} kcal</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addFoodBtn}
                onPress={() => setShowAddFood(mIdx)}
              >
                <Plus size={16} color="#1C64F2" />
                <Text style={styles.addFoodText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Food Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: bottomSheetHeight }]}>
              <View style={styles.modalDragHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Food</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchBar}>
                <Search size={18} color="#64748B" />
                <TextInput
                  placeholder="Search food..."
                  placeholderTextColor="#64748B"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <FlatList
                data={filteredFoods}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.foodList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResult}
                    onPress={() => addFoodToMeal(showAddFood!, item)}
                  >
                    <Text style={styles.resultEmoji}>{item.emoji}</Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultSub}>{item.calories} kcal · {item.serving}</Text>
                    </View>
                    <Plus size={20} color="#1C64F2" />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  dayNavigator: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  navBtn: { padding: 8, backgroundColor: "#1E293B", borderRadius: 20 },
  dayBadge: { backgroundColor: "#1E293B", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginHorizontal: 10 },
  dayText: { color: "white", fontWeight: "bold" },
  calorieCard: { backgroundColor: "#1E293B", borderRadius: 20, padding: 20, marginBottom: 20 },
  calorieHeader: { flexDirection: "row", justifyContent: "space-between" },
  calorieCardTitle: { color: "white", fontWeight: "bold", fontSize: 14 },
  goalBadge: { backgroundColor: "rgba(28, 100, 242, 0.2)", alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  goalBadgeText: { color: "#1C64F2", fontSize: 10, fontWeight: "bold" },
  remainingText: { color: "#1C64F2", fontSize: 32, fontWeight: "900" },
  unitText: { color: "#94A3B8", fontSize: 10, fontWeight: "bold" },
  statsRow: { flexDirection: "row", marginTop: 20, marginBottom: 15 },
  statItem: { flex: 1 },
  statValue: { color: "white", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#94A3B8", fontSize: 10 },
  progressBarBg: { height: 8, backgroundColor: "#0F172A", borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: "#1C64F2", borderRadius: 4 },
  macroRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  macroBox: { flex: 1, alignItems: 'center', backgroundColor: "#1E293B", padding: 10, borderRadius: 12, marginHorizontal: 4 },
  macroLabel: { color: "#94A3B8", fontSize: 10, fontWeight: "bold", marginBottom: 4 },
  macroProgressBg: { width: '100%', height: 4, backgroundColor: "#0F172A", borderRadius: 2, marginBottom: 4 },
  macroProgressFill: { height: '100%', borderRadius: 2 },
  macroValue: { color: "white", fontSize: 10, fontWeight: "bold" },
  mealsContainer: { gap: 16 },
  mealBox: { backgroundColor: "#1E293B", borderRadius: 16, overflow: 'hidden' },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#334155" },
  mealTitleRow: { flexDirection: "row", alignItems: "center" },
  mealEmoji: { fontSize: 18, marginRight: 8 },
  mealName: { color: "white", fontWeight: "bold", fontSize: 12 },
  mealKcal: { color: "white", fontWeight: "bold" },
  foodRow: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#334155" },
  foodEmojiBox: { width: 36, height: 36, backgroundColor: "#0F172A", borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  foodInfo: { flex: 1 },
  foodName: { color: "white", fontSize: 12, fontWeight: "bold" },
  foodServing: { color: "#64748B", fontSize: 10 },
  foodKcal: { color: "white", fontSize: 12 },
  addFoodBtn: { padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  addFoodText: { color: "#1C64F2", fontWeight: "bold", fontSize: 12, marginLeft: 4 },
  modalKeyboardWrapper: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'flex-end' },
  modalContent: { backgroundColor: "#1E293B", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, overflow: 'hidden' },
  modalDragHandle: { width: 40, height: 4, backgroundColor: '#475569', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  foodList: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#0F172A", padding: 12, borderRadius: 12, marginVertical: 16 },
  searchInput: { flex: 1, color: "white", marginLeft: 8 },
  searchResult: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: "#334155" },
  resultEmoji: { fontSize: 24, marginRight: 12 },
  resultInfo: { flex: 1 },
  resultName: { color: "white", fontWeight: "bold" },
  resultSub: { color: "#64748B", fontSize: 12 },
});

export default DietTracker;
