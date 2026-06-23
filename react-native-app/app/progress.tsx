import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Flame,
  Clock,
  Scale,
  Sparkles,
  Activity,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const Progress = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  // Mock data for the charts (simplified for native implementation)
  const chartData = [
    { day: "Mon", consumed: 2100, burned: 400, weight: 70.5, minutes: 45 },
    { day: "Tue", consumed: 2300, burned: 0, weight: 70.3, minutes: 0 },
    { day: "Wed", consumed: 1950, burned: 550, weight: 70.1, minutes: 60 },
    { day: "Thu", consumed: 2500, burned: 300, weight: 70.2, minutes: 30 },
    { day: "Fri", consumed: 2200, burned: 450, weight: 69.8, minutes: 50 },
    { day: "Sat", consumed: 2800, burned: 200, weight: 70.0, minutes: 20 },
    { day: "Sun", consumed: 2000, burned: 600, weight: 69.6, minutes: 75 },
  ];

  const maxConsumed = Math.max(...chartData.map(d => d.consumed));
  const maxWeight = Math.max(...chartData.map(d => d.weight));
  const minWeight = Math.min(...chartData.map(d => d.weight));

  const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSub}>{subValue}</Text>
      </View>
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
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Range Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, timeRange === "week" && styles.toggleBtnActive]}
            onPress={() => setTimeRange("week")}
          >
            <Text style={[styles.toggleText, timeRange === "week" && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, timeRange === "month" && styles.toggleBtnActive]}
            onPress={() => setTimeRange("month")}
          >
            <Text style={[styles.toggleText, timeRange === "month" && styles.toggleTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={Clock} label="ACTIVE TIME" value="325 mins" subValue="7 sessions" color="#3B82F6" />
          <StatCard icon={Flame} label="CALORIES" value="2,450 kcal" subValue="Burned" color="#F97316" />
          <StatCard icon={Sparkles} label="AVG INTAKE" value="2,180 kcal" subValue="Goal: 2,500" color="#10B981" />
          <StatCard icon={Scale} label="WEIGHT" value="69.6 kg" subValue="Target: 65.0" color="#A855F7" />
        </View>

        {/* Calorie Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            <Activity size={14} color="#F97316" /> Calorie Balance
          </Text>
          <View style={styles.barChart}>
            {chartData.map((d, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={styles.bars}>
                  <View style={[styles.bar, { height: (d.consumed / maxConsumed) * 100, backgroundColor: "#22C55E" }]} />
                  <View style={[styles.bar, { height: (d.burned / 1000) * 100, backgroundColor: "#F97316" }]} />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>Consumed</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F97316' }]} /><Text style={styles.legendText}>Burned</Text></View>
          </View>
        </View>

        {/* Weight Trend */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            <TrendingUp size={14} color="#A855F7" /> Weight Trend
          </Text>
          <View style={styles.weightChart}>
             {/* Simple visual trend representation */}
             <View style={styles.weightLineContainer}>
                {chartData.map((d, i) => (
                  <View key={i} style={styles.weightPointGroup}>
                    <View style={[styles.weightPoint, { bottom: ((d.weight - minWeight) / (maxWeight - minWeight)) * 60 + 20 }]} />
                    <Text style={styles.barLabel}>{d.day}</Text>
                  </View>
                ))}
             </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  toggleContainer: { flexDirection: "row", backgroundColor: "#1E293B", padding: 4, borderRadius: 12, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#0F172A" },
  toggleText: { color: "#64748B", fontSize: 12, fontWeight: "bold" },
  toggleTextActive: { color: "white" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: "#1E293B", borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  statLabel: { color: "#94A3B8", fontSize: 8, fontWeight: "bold" },
  statValue: { color: "white", fontSize: 14, fontWeight: "bold" },
  statSub: { color: "#64748B", fontSize: 8 },
  chartContainer: { backgroundColor: "#1E293B", borderRadius: 20, padding: 20, marginBottom: 20 },
  chartTitle: { color: "white", fontWeight: "bold", fontSize: 14, marginBottom: 20 },
  barChart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barGroup: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 2 },
  bar: { width: 8, borderRadius: 2 },
  barLabel: { color: "#64748B", fontSize: 10, marginTop: 8 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: "#94A3B8", fontSize: 10 },
  weightChart: { height: 120 },
  weightLineContainer: { flexDirection: 'row', height: '100%', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#334155' },
  weightPointGroup: { alignItems: 'center', flex: 1, height: '100%' },
  weightPoint: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: "#3B82F6" }
});

export default Progress;
