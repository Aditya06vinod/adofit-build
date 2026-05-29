import { ChevronLeft, Play, Clock, Flame, Dumbbell, CheckCircle2, Timer, Minus, Plus, Volume2, Square, Info, X, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import ProgressRing from "@/components/ProgressRing";

interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
  setsData?: WorkoutSet[];
}

interface VideoInstruction {
  youtubeId: string;
  steps: string[];
}


const bodyPartData: Record<string, { title: string; emoji: string; exercises: Exercise[] }> = {
  chest: {
    title: "Chest", emoji: "🫁",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "8-10", completed: false },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", completed: false },
      { name: "Decline Bench Press", sets: 3, reps: "10-12", completed: false },
      { name: "Cable Flyes", sets: 3, reps: "12-15", completed: false },
      { name: "Push Ups (Wide)", sets: 3, reps: "15-20", completed: false },
      { name: "Dumbbell Pullover", sets: 3, reps: "12", completed: false },
      { name: "Pec Deck Machine", sets: 3, reps: "12-15", completed: false },
      { name: "Incline Cable Flyes", sets: 3, reps: "12-15", completed: false },
      { name: "Landmine Press", sets: 3, reps: "10-12", completed: false },
      { name: "Svend Press", sets: 3, reps: "12-15", completed: false },
    ],
  },
  back: {
    title: "Back", emoji: "🔙",
    exercises: [
      { name: "Deadlifts", sets: 4, reps: "6-8", completed: false },
      { name: "Pull Ups", sets: 4, reps: "8-12", completed: false },
      { name: "Barbell Rows", sets: 3, reps: "10-12", completed: false },
      { name: "Lat Pulldown", sets: 3, reps: "12", completed: false },
      { name: "Seated Cable Row", sets: 3, reps: "12-15", completed: false },
      { name: "T-Bar Row", sets: 3, reps: "10-12", completed: false },
      { name: "Single Arm Dumbbell Row", sets: 3, reps: "10 each", completed: false },
      { name: "Chest-Supported Row", sets: 3, reps: "12", completed: false },
      { name: "Meadows Row", sets: 3, reps: "10 each", completed: false },
      { name: "Rack Pulls", sets: 3, reps: "8-10", completed: false },
      { name: "Straight Arm Pulldown", sets: 3, reps: "12-15", completed: false },
      { name: "Inverted Row", sets: 3, reps: "12-15", completed: false },
    ],
  },
  shoulders: {
    title: "Shoulders", emoji: "🤷",
    exercises: [
      { name: "Overhead Press", sets: 4, reps: "8-10", completed: false },
      { name: "Lateral Raises", sets: 4, reps: "12-15", completed: false },
      { name: "Face Pulls", sets: 3, reps: "15", completed: false },
      { name: "Front Raises", sets: 3, reps: "12", completed: false },
      { name: "Arnold Press", sets: 3, reps: "10-12", completed: false },
      { name: "Reverse Pec Deck", sets: 3, reps: "12-15", completed: false },
      { name: "Cable Lateral Raises", sets: 3, reps: "12-15", completed: false },
      { name: "Z Press", sets: 3, reps: "8-10", completed: false },
      { name: "Lu Raises", sets: 3, reps: "10-12", completed: false },
      { name: "Rear Delt Flyes", sets: 3, reps: "15", completed: false },
      { name: "Dumbbell Upright Row", sets: 3, reps: "12", completed: false },
    ],
  },
  arms: {
    title: "Arms", emoji: "💪",
    exercises: [
      { name: "Barbell Curls", sets: 3, reps: "10-12", completed: false },
      { name: "Skull Crushers", sets: 3, reps: "10-12", completed: false },
      { name: "Hammer Curls", sets: 3, reps: "12", completed: false },
      { name: "Tricep Pushdown", sets: 3, reps: "12-15", completed: false },
      { name: "Concentration Curls", sets: 3, reps: "12", completed: false },
      { name: "Overhead Tricep Extension", sets: 3, reps: "12", completed: false },
      { name: "Preacher Curls", sets: 3, reps: "10-12", completed: false },
      { name: "Close-Grip Bench Press", sets: 3, reps: "10-12", completed: false },
      { name: "Incline Dumbbell Curls", sets: 3, reps: "10-12", completed: false },
      { name: "Tricep Dips", sets: 3, reps: "12-15", completed: false },
      { name: "Cable Curls (Rope)", sets: 3, reps: "12-15", completed: false },
      { name: "Diamond Push-ups", sets: 3, reps: "15", completed: false },
      { name: "Spider Curls", sets: 3, reps: "12", completed: false },
      { name: "Tricep Kickbacks", sets: 3, reps: "12 each", completed: false },
    ],
  },
  forearms: {
    title: "Forearms", emoji: "🦾",
    exercises: [
      { name: "Wrist Curls", sets: 4, reps: "15-20", completed: false },
      { name: "Reverse Wrist Curls", sets: 3, reps: "15", completed: false },
      { name: "Farmer's Walk", sets: 3, reps: "40m", completed: false },
      { name: "Plate Pinch Hold", sets: 3, reps: "30 sec", completed: false },
      { name: "Towel Pull-ups", sets: 3, reps: "8-10", completed: false },
      { name: "Behind-the-Back Wrist Curls", sets: 3, reps: "15", completed: false },
      { name: "Reverse Barbell Curls", sets: 3, reps: "12", completed: false },
      { name: "Dead Hangs", sets: 3, reps: "45 sec", completed: false },
      { name: "Wrist Roller", sets: 3, reps: "3 rolls", completed: false },
    ],
  },
  legs: {
    title: "Legs", emoji: "🦵",
    exercises: [
      { name: "Barbell Squats", sets: 4, reps: "8-10", completed: false },
      { name: "Romanian Deadlifts", sets: 3, reps: "10-12", completed: false },
      { name: "Leg Press", sets: 3, reps: "12", completed: false },
      { name: "Walking Lunges", sets: 3, reps: "12 each", completed: false },
      { name: "Leg Curls", sets: 3, reps: "12-15", completed: false },
      { name: "Leg Extensions", sets: 3, reps: "12-15", completed: false },
      { name: "Calf Raises", sets: 4, reps: "15-20", completed: false },
      { name: "Front Squats", sets: 3, reps: "8-10", completed: false },
      { name: "Hack Squats", sets: 3, reps: "10-12", completed: false },
      { name: "Sissy Squats", sets: 3, reps: "12-15", completed: false },
      { name: "Goblet Squats", sets: 3, reps: "12", completed: false },
      { name: "Step Ups (Weighted)", sets: 3, reps: "10 each", completed: false },
      { name: "Box Jumps", sets: 3, reps: "10", completed: false },
    ],
  },
  core: {
    title: "Core", emoji: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "60 sec", completed: false },
      { name: "Hanging Leg Raises", sets: 3, reps: "12-15", completed: false },
      { name: "Russian Twists", sets: 3, reps: "20", completed: false },
      { name: "Ab Wheel Rollout", sets: 3, reps: "10-12", completed: false },
      { name: "Cable Woodchops", sets: 3, reps: "12 each", completed: false },
      { name: "Bicycle Crunches", sets: 3, reps: "20", completed: false },
      { name: "Dragon Flags", sets: 3, reps: "6-8", completed: false },
      { name: "Pallof Press", sets: 3, reps: "12 each", completed: false },
      { name: "Decline Sit-ups", sets: 3, reps: "15", completed: false },
      { name: "Dead Bug", sets: 3, reps: "10 each", completed: false },
      { name: "V-Ups", sets: 3, reps: "15", completed: false },
      { name: "Toe Touches", sets: 3, reps: "15", completed: false },
    ],
  },
  glutes: {
    title: "Glutes", emoji: "🍑",
    exercises: [
      { name: "Hip Thrusts", sets: 4, reps: "10-12", completed: false },
      { name: "Bulgarian Split Squats", sets: 3, reps: "10 each", completed: false },
      { name: "Sumo Deadlifts", sets: 3, reps: "10-12", completed: false },
      { name: "Cable Kickbacks", sets: 3, reps: "12 each", completed: false },
      { name: "Glute Bridge", sets: 3, reps: "15", completed: false },
      { name: "Step Ups", sets: 3, reps: "12 each", completed: false },
      { name: "Single Leg Hip Thrust", sets: 3, reps: "10 each", completed: false },
      { name: "Frog Pumps", sets: 3, reps: "20", completed: false },
      { name: "Banded Walks", sets: 3, reps: "15 each", completed: false },
      { name: "Good Mornings", sets: 3, reps: "12", completed: false },
    ],
  },
  calves: {
    title: "Calves", emoji: "🏔️",
    exercises: [
      { name: "Standing Calf Raises", sets: 4, reps: "15-20", completed: false },
      { name: "Seated Calf Raises", sets: 4, reps: "15-20", completed: false },
      { name: "Donkey Calf Raises", sets: 3, reps: "15", completed: false },
      { name: "Single Leg Calf Raise", sets: 3, reps: "12 each", completed: false },
      { name: "Jump Rope", sets: 3, reps: "60 sec", completed: false },
      { name: "Smith Machine Calf Raise", sets: 3, reps: "15-20", completed: false },
      { name: "Leg Press Calf Raise", sets: 3, reps: "15", completed: false },
      { name: "Tibialis Raises", sets: 3, reps: "15", completed: false },
    ],
  },
  neck: {
    title: "Neck", emoji: "🦴",
    exercises: [
      { name: "Neck Flexion (Plate)", sets: 3, reps: "12-15", completed: false },
      { name: "Neck Extension", sets: 3, reps: "12-15", completed: false },
      { name: "Lateral Neck Flexion", sets: 3, reps: "12 each", completed: false },
      { name: "Neck Harness", sets: 3, reps: "15", completed: false },
      { name: "Shrugs", sets: 4, reps: "12-15", completed: false },
      { name: "Neck Curls (Lying)", sets: 3, reps: "15", completed: false },
      { name: "Band Neck Resistance", sets: 3, reps: "12 each", completed: false },
    ],
  },
  traps: {
    title: "Traps", emoji: "🔺",
    exercises: [
      { name: "Barbell Shrugs", sets: 4, reps: "12-15", completed: false },
      { name: "Dumbbell Shrugs", sets: 3, reps: "15", completed: false },
      { name: "Face Pulls", sets: 3, reps: "15", completed: false },
      { name: "Upright Rows", sets: 3, reps: "12", completed: false },
      { name: "Farmer's Walk", sets: 3, reps: "40m", completed: false },
      { name: "Behind-the-Back Shrugs", sets: 3, reps: "12-15", completed: false },
      { name: "Cable Shrugs", sets: 3, reps: "15", completed: false },
      { name: "Rack Pulls (Above Knee)", sets: 3, reps: "8-10", completed: false },
      { name: "Overhead Shrugs", sets: 3, reps: "12", completed: false },
    ],
  },
  lats: {
    title: "Lats", emoji: "🦅",
    exercises: [
      { name: "Wide-Grip Lat Pulldown", sets: 4, reps: "10-12", completed: false },
      { name: "Close-Grip Pulldown", sets: 3, reps: "12", completed: false },
      { name: "Straight Arm Pulldown", sets: 3, reps: "12-15", completed: false },
      { name: "Chin Ups", sets: 3, reps: "8-12", completed: false },
      { name: "Single Arm Cable Row", sets: 3, reps: "12 each", completed: false },
      { name: "Dumbbell Pullover", sets: 3, reps: "12", completed: false },
      { name: "Kayak Row", sets: 3, reps: "10 each", completed: false },
    ],
  },
  obliques: {
    title: "Obliques", emoji: "🔄",
    exercises: [
      { name: "Cable Woodchops", sets: 3, reps: "12 each", completed: false },
      { name: "Russian Twists", sets: 3, reps: "20", completed: false },
      { name: "Side Plank", sets: 3, reps: "45 sec each", completed: false },
      { name: "Bicycle Crunches", sets: 3, reps: "20", completed: false },
      { name: "Hanging Oblique Raises", sets: 3, reps: "10 each", completed: false },
      { name: "Pallof Press", sets: 3, reps: "12 each", completed: false },
      { name: "Windshield Wipers", sets: 3, reps: "10", completed: false },
      { name: "Side Bend (Dumbbell)", sets: 3, reps: "15 each", completed: false },
    ],
  },
  hamstrings: {
    title: "Hamstrings", emoji: "🦵",
    exercises: [
      { name: "Romanian Deadlifts", sets: 4, reps: "10-12", completed: false },
      { name: "Lying Leg Curls", sets: 3, reps: "12-15", completed: false },
      { name: "Seated Leg Curls", sets: 3, reps: "12-15", completed: false },
      { name: "Nordic Curls", sets: 3, reps: "6-8", completed: false },
      { name: "Single Leg Deadlift", sets: 3, reps: "10 each", completed: false },
      { name: "Glute Ham Raise", sets: 3, reps: "10", completed: false },
      { name: "Good Mornings", sets: 3, reps: "12", completed: false },
      { name: "Slider Leg Curls", sets: 3, reps: "12", completed: false },
    ],
  },
  "hip-flexors": {
    title: "Hip Flexors", emoji: "🧘",
    exercises: [
      { name: "Hanging Knee Raises", sets: 3, reps: "12-15", completed: false },
      { name: "Psoas March", sets: 3, reps: "12 each", completed: false },
      { name: "Standing Knee Drive", sets: 3, reps: "15 each", completed: false },
      { name: "Banded Hip Flexion", sets: 3, reps: "12 each", completed: false },
      { name: "Leg Swings", sets: 3, reps: "15 each", completed: false },
      { name: "Mountain Climbers", sets: 3, reps: "20 each", completed: false },
      { name: "Kneeling Lunge Stretch", sets: 3, reps: "30 sec each", completed: false },
    ],
  },
  "rear-delts": {
    title: "Rear Delts", emoji: "🎯",
    exercises: [
      { name: "Face Pulls", sets: 4, reps: "15", completed: false },
      { name: "Reverse Pec Deck", sets: 3, reps: "12-15", completed: false },
      { name: "Bent Over Rear Delt Flyes", sets: 3, reps: "15", completed: false },
      { name: "Cable Rear Delt Flyes", sets: 3, reps: "12-15", completed: false },
      { name: "Band Pull-Aparts", sets: 3, reps: "20", completed: false },
      { name: "Prone Y Raises", sets: 3, reps: "12", completed: false },
      { name: "Rear Delt Row", sets: 3, reps: "12", completed: false },
    ],
  },
  "lower-back": {
    title: "Lower Back", emoji: "🔙",
    exercises: [
      { name: "Back Extension", sets: 3, reps: "12-15", completed: false },
      { name: "Good Mornings", sets: 3, reps: "12", completed: false },
      { name: "Superman Hold", sets: 3, reps: "30 sec", completed: false },
      { name: "Reverse Hyper", sets: 3, reps: "12-15", completed: false },
      { name: "Bird Dog", sets: 3, reps: "10 each", completed: false },
      { name: "Jefferson Curls", sets: 3, reps: "8", completed: false },
      { name: "Cat-Cow Stretch", sets: 3, reps: "15", completed: false },
      { name: "Deadlift (Light)", sets: 3, reps: "12", completed: false },
    ],
  },
};

// Beep sound using Web Audio API
const playBeep = (frequency = 880, duration = 200, count = 3) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let time = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration / 1000);
      osc.start(time);
      osc.stop(time + duration / 1000);
      time += (duration + 100) / 1000;
    }
  } catch (e) { /* audio not available */ }
};

const REST_PRESETS = [30, 45, 60, 90, 120];

// Exercise to YouTube Video mapping database
const exerciseInstructions: Record<string, VideoInstruction> = {
  "bench press": {
    youtubeId: "gRVjAtPip0Y",
    steps: [
      "Lie flat on a bench, grip the barbell slightly wider than shoulder-width.",
      "Lower the bar slowly to your chest, keeping elbows at a 45-degree angle.",
      "Push the bar back up powerfully by extending your arms."
    ]
  },
  "dumbbell press": {
    youtubeId: "8iPEnnM__kA",
    steps: [
      "Lie on the bench with dumbbells at chest level, palms facing forward.",
      "Press the dumbbells straight up over your chest without locking your elbows.",
      "Slowly lower them back down to the sides of your chest."
    ]
  },
  "cable fly": {
    youtubeId: "p5PR68G4tBc",
    steps: [
      "Stand between cable pulleys, hold handles with arms extended slightly bent.",
      "Bring your hands together in a wide arc in front of your chest.",
      "Slowly return to the starting position with control."
    ]
  },
  "push up": {
    youtubeId: "IODxDxX7oi4",
    steps: [
      "Place hands slightly wider than shoulder-width, feet close together.",
      "Lower your chest to the floor keeping your back straight and core tight.",
      "Push back up to the starting position."
    ]
  },
  "pullover": {
    youtubeId: "h1H4o4U4hH8",
    steps: [
      "Lie perpendicular on a bench, holding a dumbbell with both hands over chest.",
      "Lower the weight backward in an arc behind your head.",
      "Pull the weight back up to the starting position."
    ]
  },
  "pec deck": {
    youtubeId: "eGjt4lk6gJw",
    steps: [
      "Sit back against the pad, grip the handles, and place forearms on pads.",
      "Squeeze your chest to bring the handles/pads together in the center.",
      "Slowly return to the start, feeling a stretch in your chest."
    ]
  },
  "press": {
    youtubeId: "2yjwHeFToJ0",
    steps: [
      "Stand or sit holding the weight at shoulder level.",
      "Press the weight straight up overhead until arms are extended.",
      "Lower the weight back down with control."
    ]
  },
  "deadlift": {
    youtubeId: "op9kVnSso6Q",
    steps: [
      "Stand with feet hip-width apart, barbell over mid-foot.",
      "Bend at hips and knees, grip the bar, keep back flat and chest up.",
      "Drive through your heels to stand up, pulling the bar up to hip level."
    ]
  },
  "pull up": {
    youtubeId: "eGo4IYlbE5g",
    steps: [
      "Grip the pull-up bar with hands wider than shoulder-width, palms facing away.",
      "Pull your chest up toward the bar, retracting your shoulder blades.",
      "Lower yourself slowly back down to a dead hang."
    ]
  },
  "row": {
    youtubeId: "gQB25HD29bM",
    steps: [
      "Bend at the hips, keeping your back flat and knees slightly bent.",
      "Pull the barbell or dumbbell up toward your lower ribcage.",
      "Slowly lower the weight back down with control."
    ]
  },
  "pulldown": {
    youtubeId: "CAwf7n6Luuc",
    steps: [
      "Sit at the pulldown station, grip the bar wider than shoulder-width.",
      "Pull the bar down to your upper chest while retracting shoulder blades.",
      "Return the bar to the start position with control."
    ]
  },
  "overhead press": {
    youtubeId: "2yjwHeFToJ0",
    steps: [
      "Hold the barbell at your upper chest, feet shoulder-width apart.",
      "Press the bar overhead, extending arms fully and squeezing glutes.",
      "Lower the bar back to your upper chest."
    ]
  },
  "lateral raise": {
    youtubeId: "gwLzBJYoWlI",
    steps: [
      "Stand holding dumbbells at your sides, chest out.",
      "Raise your arms out to the sides until they are parallel to the floor.",
      "Slowly lower the dumbbells back to your sides."
    ]
  },
  "face pull": {
    youtubeId: "rep-qV5ibjI",
    steps: [
      "Hold rope handles from a high cable pulley, palms facing inward.",
      "Pull the rope toward your face, separating the ends toward your ears.",
      "Slowly return to the starting position."
    ]
  },
  "rear delt": {
    youtubeId: "z160v1H1o6o",
    steps: [
      "Bend forward at the hips, keeping your back flat.",
      "Raise dumbbells out to the sides, focusing on the back of your shoulders.",
      "Lower the weights back down with control."
    ]
  },
  "curl": {
    youtubeId: "ykJgr1RFoKo",
    steps: [
      "Stand holding weights, elbows tucked close to your torso.",
      "Squeeze biceps to curl the weights up while keeping upper arms still.",
      "Slowly lower the weights back to the starting position."
    ]
  },
  "skull crusher": {
    youtubeId: "d_KZxPfBYps",
    steps: [
      "Lie on a bench, hold barbell/dumbbell overhead with arms straight.",
      "Bend at the elbows to lower the weight to your forehead/behind head.",
      "Extend your arms back to the starting position."
    ]
  },
  "pushdown": {
    youtubeId: "2-LAMgAqyWY",
    steps: [
      "Hold the cable bar/rope at chest level, elbows tucked.",
      "Push the bar/rope down by extending your arms, squeezing triceps at the bottom.",
      "Slowly bring the cable back to chest level."
    ]
  },
  "dip": {
    youtubeId: "2z8JmcrW-As",
    steps: [
      "Support your body on dip bars, arms straight, knees bent.",
      "Lower your body by bending elbows to 90 degrees.",
      "Push back up to the starting position."
    ]
  },
  "squat": {
    youtubeId: "gcNh17Ckjgg",
    steps: [
      "Place barbell on upper back/traps, feet shoulder-width apart.",
      "Bend knees and hips, lowering your body as if sitting in a chair.",
      "Go down until thighs are parallel to the floor, then stand back up."
    ]
  },
  "leg press": {
    youtubeId: "IZxyjWwJYlU",
    steps: [
      "Sit on the machine, feet shoulder-width apart on the sled.",
      "Lower the sled toward your chest by bending knees to 90 degrees.",
      "Press the sled back up without locking your knees."
    ]
  },
  "lunge": {
    youtubeId: "QOVaHWMqZyU",
    steps: [
      "Stand tall, step forward with one leg.",
      "Lower your hips until your back knee is just above the floor.",
      "Push off your front foot to return to the starting position."
    ]
  },
  "hip thrust": {
    youtubeId: "LM8XHLYJoYs",
    steps: [
      "Sit on the floor, upper back against a bench, barbell over hips.",
      "Drive through your heels to lift your hips up to bench level.",
      "Squeeze glutes at the top, then lower your hips back down."
    ]
  },
  "glute bridge": {
    youtubeId: "wPM8co452Cw",
    steps: [
      "Lie on your back, knees bent, feet flat on the floor.",
      "Lift your hips off the floor, squeezing your glutes.",
      "Lower your hips back to the starting position."
    ]
  },
  "plank": {
    youtubeId: "pSHjTRCQxIw",
    steps: [
      "Place forearms on floor, elbows aligned under shoulders.",
      "Keep body in a straight line from head to heels, core engaged.",
      "Hold the position without letting hips sag."
    ]
  },
  "twist": {
    youtubeId: "wkD8rjkodUI",
    steps: [
      "Sit on the floor, knees bent, leaning back slightly.",
      "Hold hands or a weight, rotate your torso from side to side.",
      "Keep your core engaged throughout the movement."
    ]
  },
  "shrug": {
    youtubeId: "cJRVVxmytaM",
    steps: [
      "Stand holding dumbbells or a barbell at your sides/front.",
      "Elevate your shoulders straight up toward your ears.",
      "Hold briefly at the top, then lower slowly."
    ]
  },
  "extension": {
    youtubeId: "ms6gOTSBjRE",
    steps: [
      "Hold the weight behind your head or use a cable station.",
      "Extend your arms overhead by straightening your elbows.",
      "Slowly lower the weight back behind your head."
    ]
  },
  "kickback": {
    youtubeId: "ZO81bExngMI",
    steps: [
      "Bend forward at the hips, hold a dumbbell in one hand.",
      "Extend your arm straight back, squeezing the tricep.",
      "Slowly return to the starting position."
    ]
  },
  "calf raise": {
    youtubeId: "gwLzBJYoWlI",
    steps: [
      "Stand on the edge of a step or platform with heels hanging off.",
      "Rise up on your toes as high as possible.",
      "Lower your heels below the platform for a full stretch."
    ]
  },
  "leg extension": {
    youtubeId: "YyvSfVjQeL0",
    steps: [
      "Sit on the machine with your back against the pad.",
      "Extend your legs until they are straight, squeezing quads.",
      "Slowly lower the weight back down with control."
    ]
  },
  "leg curl": {
    youtubeId: "1Tq3QdYUuHs",
    steps: [
      "Lie face down or sit on the leg curl machine.",
      "Curl your legs toward your glutes by bending at the knees.",
      "Slowly extend your legs back to the start."
    ]
  },
  "good morning": {
    youtubeId: "YA-h3n9L4YU",
    steps: [
      "Place a barbell on your upper back, feet shoulder-width apart.",
      "Hinge at the hips, lowering your torso until nearly parallel to the floor.",
      "Drive your hips forward to return to standing."
    ]
  },
  "farmer": {
    youtubeId: "Fkzk_RqlYig",
    steps: [
      "Pick up heavy dumbbells or kettlebells in each hand.",
      "Stand tall with shoulders back and core braced.",
      "Walk forward with controlled, steady steps."
    ]
  },
  "step up": {
    youtubeId: "dQqApCGd5Cw",
    steps: [
      "Stand in front of a bench or box, holding dumbbells.",
      "Step up with one foot, driving through your heel.",
      "Step back down with control and repeat."
    ]
  },
  "box jump": {
    youtubeId: "52r_Ul5k03g",
    steps: [
      "Stand in front of a sturdy box at an appropriate height.",
      "Swing your arms and jump onto the box, landing softly.",
      "Step back down and repeat."
    ]
  },
  "ab wheel": {
    youtubeId: "rqiTPl9SRsg",
    steps: [
      "Kneel on the floor, gripping the ab wheel handles.",
      "Roll the wheel forward, extending your body as far as possible.",
      "Use your core to pull the wheel back to the starting position."
    ]
  },
  "woodchop": {
    youtubeId: "pAplQXk3dkU",
    steps: [
      "Stand sideways to a cable machine, grip the handle with both hands.",
      "Rotate your torso, pulling the cable diagonally across your body.",
      "Return slowly to the starting position."
    ]
  },
  "bicycle": {
    youtubeId: "9FGilxCbdz8",
    steps: [
      "Lie on your back, hands behind your head, legs raised.",
      "Bring one knee toward your chest while rotating the opposite elbow toward it.",
      "Alternate sides in a pedaling motion."
    ]
  },
  "sit up": {
    youtubeId: "1fbU_MkV7NE",
    steps: [
      "Lie on your back with knees bent and feet flat.",
      "Engage your core to lift your torso up toward your knees.",
      "Lower back down with control."
    ]
  },
  "dead bug": {
    youtubeId: "4XLEnwUr1d8",
    steps: [
      "Lie on your back with arms extended toward the ceiling and knees at 90 degrees.",
      "Slowly extend one arm and the opposite leg toward the floor.",
      "Return to start and repeat on the other side."
    ]
  },
  "v-up": {
    youtubeId: "iP2fjvG0yOE",
    steps: [
      "Lie flat on your back with arms extended overhead.",
      "Simultaneously lift your legs and torso to touch your toes.",
      "Lower back down with control."
    ]
  },
  "crunch": {
    youtubeId: "Xyd_fa5zoEU",
    steps: [
      "Lie on your back with knees bent, hands behind your head.",
      "Curl your shoulders off the floor by contracting your abs.",
      "Lower back down slowly without fully relaxing."
    ]
  },
  "superman": {
    youtubeId: "z6PJMT2y8GQ",
    steps: [
      "Lie face down with arms extended in front of you.",
      "Simultaneously lift your arms, chest, and legs off the floor.",
      "Hold briefly, then lower back down."
    ]
  },
  "bird dog": {
    youtubeId: "wiFNA3sqjCA",
    steps: [
      "Start on all fours with hands under shoulders and knees under hips.",
      "Extend one arm forward and the opposite leg backward simultaneously.",
      "Return to start and repeat on the other side."
    ]
  },
  "back extension": {
    youtubeId: "ph3pddpKzzw",
    steps: [
      "Position yourself on a back extension bench, feet secured.",
      "Lower your upper body toward the floor by hinging at the hips.",
      "Raise back up until your body is in a straight line."
    ]
  },
  "mountain climber": {
    youtubeId: "nmwgirgXLYM",
    steps: [
      "Start in a push-up position with arms straight.",
      "Drive one knee toward your chest rapidly.",
      "Alternate legs in a running motion while keeping core tight."
    ]
  },
  "burpee": {
    youtubeId: "dZgVxmf6jkA",
    steps: [
      "Stand tall, then squat down and place hands on the floor.",
      "Jump your feet back into a plank, do a push-up.",
      "Jump feet forward and explosively jump up with arms overhead."
    ]
  },
  "jump rope": {
    youtubeId: "u3zgKRBgMCA",
    steps: [
      "Hold the rope handles at hip height, elbows close to your body.",
      "Swing the rope overhead and jump just high enough to clear it.",
      "Land softly on the balls of your feet and maintain a steady rhythm."
    ]
  },
  "nordic": {
    youtubeId: "jBO2d7Rnf5E",
    steps: [
      "Kneel on the floor with someone holding your ankles.",
      "Slowly lower your body forward, resisting with your hamstrings.",
      "Catch yourself at the bottom and push back up."
    ]
  },
  "pallof": {
    youtubeId: "AH_QZLm_0-s",
    steps: [
      "Stand sideways to a cable machine, hold the handle at chest height.",
      "Press the handle straight out in front of you, resisting rotation.",
      "Hold briefly, then bring it back to your chest."
    ]
  },
  "reverse hyper": {
    youtubeId: "ZeH-m9BuNfU",
    steps: [
      "Lie face down on a bench with your hips at the edge.",
      "Raise your legs behind you by squeezing your glutes.",
      "Lower them slowly back down."
    ]
  },
  "dragon flag": {
    youtubeId: "njKXkRH7nik",
    steps: [
      "Lie on a bench, grip the edges behind your head.",
      "Raise your entire body up, keeping it straight like a flag.",
      "Lower slowly without letting your back touch the bench."
    ]
  },
  "frog pump": {
    youtubeId: "BrKGnF-MUVs",
    steps: [
      "Lie on your back with soles of feet together, knees flared out.",
      "Drive your hips up by squeezing your glutes.",
      "Lower back down and repeat."
    ]
  },
  "band pull": {
    youtubeId: "iaaU-nF-sSo",
    steps: [
      "Hold a resistance band in front of you at chest height.",
      "Pull the band apart by squeezing your rear delts and upper back.",
      "Return to the starting position with control."
    ]
  },
  "chin up": {
    youtubeId: "brhRXlOhGfY",
    steps: [
      "Grip the bar with palms facing toward you, shoulder-width apart.",
      "Pull yourself up until your chin is above the bar.",
      "Lower yourself slowly back to a dead hang."
    ]
  },
  "rack pull": {
    youtubeId: "u7XRkreKNBM",
    steps: [
      "Set the barbell at knee height on a squat rack.",
      "Grip the bar and stand up by extending your hips and knees.",
      "Lower the bar back to the rack with control."
    ]
  },
  "upright row": {
    youtubeId: "amCU-ziHITM",
    steps: [
      "Hold a barbell or dumbbells in front of your thighs.",
      "Pull the weight up along your body to chin height, elbows flaring out.",
      "Lower the weight back down slowly."
    ]
  },
  "neck": {
    youtubeId: "gJ3gP0cisbM",
    steps: [
      "Sit or stand with good posture and place resistance on your head.",
      "Move your head against the resistance in the target direction.",
      "Return slowly to neutral position."
    ]
  },
  "dead hang": {
    youtubeId: "dL-1CLsrblY",
    steps: [
      "Grip a pull-up bar with both hands, arms fully extended.",
      "Hang freely, engaging your shoulders and core.",
      "Hold for the prescribed time, then release."
    ]
  },
  "raise": {
    youtubeId: "hdZkxA1EDwg",
    steps: [
      "Lie on your back or hang from a bar, legs straight.",
      "Raise your legs up to 90 degrees (or hip height if hanging).",
      "Lower them slowly back to the starting position."
    ]
  }
};

const getExerciseInstruction = (name: string): VideoInstruction => {
  const cleanName = name.toLowerCase();
  for (const [key, value] of Object.entries(exerciseInstructions)) {
    if (cleanName.includes(key)) {
      return value;
    }
  }
  return {
    youtubeId: "gcNh17Ckjgg", // default fallback
    steps: [
      "Focus on performing the exercise with strict, controlled posture.",
      "Inhale on the eccentric phase (lowering) and exhale on the concentric phase (lifting).",
      "Ensure a full range of motion without locking out joints at the extreme point."
    ]
  };
};

const BodyPartWorkout = () => {
  const navigate = useNavigate();
  const { part } = useParams<{ part: string }>();
  const data = bodyPartData[part || "chest"];
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [instructionExercise, setInstructionExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [interval, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [restDuration, setRestDuration] = useState(60);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  // Initialize exercises with detailed sets/reps
  useEffect(() => {
    if (data?.exercises) {
      setExercises(
        data.exercises.map((ex, idx) => {
          const repsVal = ex.reps.includes("-") ? ex.reps.split("-")[1] : ex.reps.replace(/\D/g, "") || "10";
          const defaultWeight = ex.name.toLowerCase().includes("squat") || ex.name.toLowerCase().includes("press") || ex.name.toLowerCase().includes("deadlift") ? "40" : "10";
          return {
            ...ex,
            setsData: Array.from({ length: ex.sets }).map((_, sIdx) => ({
              id: `set-${idx}-${sIdx}-${Math.random()}`,
              weight: defaultWeight,
              reps: repsVal,
              completed: false,
            })),
          };
        })
      );
    }
  }, [part, data]);

  if (!data) {
    return (
      <MobileLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-muted-foreground">Body part not found</p>
        </div>
      </MobileLayout>
    );
  }

  const completedCount = exercises.filter((e) => e.completed).length;
  const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  const toggleExercise = (index: number) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i === index) {
          const nextCompleted = !e.completed;
          const updatedSets = (e.setsData || []).map(s => ({
            ...s,
            completed: nextCompleted
          }));
          return {
            ...e,
            completed: nextCompleted,
            setsData: updatedSets
          };
        }
        return e;
      })
    );
  };

  const toggleSetComplete = (exerciseIdx: number, setId: string) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx === exerciseIdx) {
          const updatedSets = (ex.setsData || []).map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted = updatedSets.every((s) => s.completed);
          return {
            ...ex,
            setsData: updatedSets,
            completed: allCompleted,
          };
        }
        return ex;
      })
    );
  };

  const updateSetField = (exerciseIdx: number, setId: string, field: "weight" | "reps", value: string) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx === exerciseIdx) {
          return {
            ...ex,
            setsData: (ex.setsData || []).map((s) =>
              s.id === setId ? { ...s, [field]: value } : s
            ),
          };
        }
        return ex;
      })
    );
  };

  const startWorkout = () => {
    setIsActive(true);
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    setIntervalId(id);
  };

  const stopWorkout = () => {
    setIsActive(false);
    if (interval) clearInterval(interval);
    stopRest();
  };

  const startRest = () => {
    setIsResting(true);
    setRestRemaining(restDuration);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!);
          restIntervalRef.current = null;
          setIsResting(false);
          playBeep(880, 200, 3);
          return 0;
        }
        if (prev === 4) playBeep(660, 100, 1);
        return prev - 1;
      });
    }, 1000);
  };

  const stopRest = () => {
    setIsResting(false);
    setRestRemaining(0);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const restProgress = restDuration > 0 ? ((restDuration - restRemaining) / restDuration) * 100 : 0;

  const activeInstruction = instructionExercise ? getExerciseInstruction(instructionExercise) : null;

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-4 pb-28">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="text-base font-bold">{data.emoji} {data.title} Workout</h1>
          <div className="w-6" />
        </div>

        <div className="mt-4 gym-gradient-card rounded-2xl p-5">
          <div className="flex items-center gap-5">
            <ProgressRing progress={progress} size={80} strokeWidth={5} />
            <div className="flex-1">
              <h3 className="text-sm font-bold">{data.title} Day</h3>
              <p className="mt-1 text-2xl font-bold gym-text-gradient">{completedCount}/{exercises.length}</p>
              <p className="text-[10px] text-muted-foreground">exercises done</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">{Math.round(timer * 0.15)} Cal</span>
            </div>
          </div>
        </div>

        {/* Rest Timer Card */}
        <div className={`mt-3 rounded-2xl p-4 transition-all duration-500 ${isResting ? "gym-gradient-orange" : "gym-gradient-card"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className={`h-4 w-4 ${isResting ? "text-primary-foreground" : "text-primary"}`} />
              <span className={`text-xs font-bold ${isResting ? "text-primary-foreground" : ""}`}>Rest Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className={`h-3 w-3 ${isResting ? "text-primary-foreground/60" : "text-muted-foreground"}`} />
              <span className={`text-[9px] ${isResting ? "text-primary-foreground/60" : "text-muted-foreground"}`}>Sound on</span>
            </div>
          </div>

          {isResting ? (
            <div className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary-foreground) / 0.2)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - restProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary-foreground">{restRemaining}s</span>
                </div>
              </div>
              <button onClick={stopRest}
                className="flex mx-auto items-center gap-2 rounded-xl bg-primary-foreground/20 px-6 py-2 text-xs font-bold text-primary-foreground active:scale-95 transition-transform">
                <Square className="h-3 w-3" /> Skip Rest
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-3 mb-3">
                <button onClick={() => setRestDuration(d => Math.max(10, d - 15))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:scale-90 transition-transform">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-2xl font-black w-16 text-center">{restDuration}s</span>
                <button onClick={() => setRestDuration(d => Math.min(300, d + 15))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:scale-90 transition-transform">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-1.5 justify-center mb-3">
                {REST_PRESETS.map(p => (
                  <button key={p} onClick={() => setRestDuration(p)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                      restDuration === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {p}s
                  </button>
                ))}
              </div>
              <button onClick={startRest}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/15 py-2.5 text-xs font-bold text-primary active:scale-95 transition-transform">
                <Timer className="h-3.5 w-3.5" /> Start Rest
              </button>
            </div>
          )}
        </div>

        <button
          onClick={isActive ? stopWorkout : startWorkout}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-transform active:scale-95 ${
            isActive ? "bg-destructive text-destructive-foreground" : "gym-gradient-orange text-primary-foreground"
          }`}
        >
          <Play className="h-4 w-4" />
          {isActive ? "End Workout" : "Start Workout"}
        </button>

        {/* Exercises Cards with Sets subsections */}
        <div className="mt-4 space-y-4 pb-4">
          {exercises.map((exercise, index) => (
            <div 
              key={index}
              className={`bg-card border border-border/30 rounded-2xl p-4 shadow-sm transition-all ${
                exercise.completed ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setInstructionExercise(exercise.name)}
                  className="flex items-center gap-3 text-left group hover:opacity-85 transition-opacity"
                  title="Tap to see instructions"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Dumbbell className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C64F2] flex items-center gap-1.5 flex-wrap">
                      {exercise.name}
                      <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Info className="h-2.5 w-2.5" /> Video
                      </span>
                    </h3>
                  </div>
                </button>
                <button
                  onClick={() => toggleExercise(index)}
                  className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all ${
                    exercise.completed 
                      ? "bg-primary border-primary text-white" 
                      : "bg-secondary border-border hover:border-muted-foreground text-transparent"
                  }`}
                  title="Mark exercise complete"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>
              </div>

              {/* Sets Table Subsection */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-[9px] font-bold uppercase text-muted-foreground">
                      <th className="py-1 w-10 text-center">Set</th>
                      <th className="py-1 text-center w-20">kg</th>
                      <th className="py-1 text-center w-20">Reps</th>
                      <th className="py-1 text-center w-10">✓</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {(exercise.setsData || []).map((set, sIdx) => (
                      <tr 
                        key={set.id}
                        className={`transition-colors border-b border-border/10 last:border-0 ${
                          set.completed 
                            ? "bg-[#2D452B]/25 text-[#58D66D]" 
                            : "hover:bg-secondary/20"
                        }`}
                      >
                        {/* Set index */}
                        <td className="py-2 text-xs font-bold text-center text-muted-foreground">
                          {sIdx + 1}
                        </td>

                        {/* Weight input */}
                        <td className="py-2 text-center">
                          <input 
                            type="number" 
                            value={set.weight} 
                            disabled={set.completed || !isActive}
                            onChange={(e) => updateSetField(index, set.id, "weight", e.target.value)}
                            className="w-16 bg-secondary border border-border/30 rounded py-1 text-center text-xs font-bold outline-none text-foreground disabled:opacity-70"
                          />
                        </td>

                        {/* Reps input */}
                        <td className="py-2 text-center">
                          <input 
                            type="number" 
                            value={set.reps} 
                            disabled={set.completed || !isActive}
                            onChange={(e) => updateSetField(index, set.id, "reps", e.target.value)}
                            className="w-16 bg-secondary border border-border/30 rounded py-1 text-center text-xs font-bold outline-none text-foreground disabled:opacity-70"
                          />
                        </td>

                        {/* Checkbox */}
                        <td className="py-2 text-center">
                          <button
                            disabled={!isActive}
                            onClick={() => toggleSetComplete(index, set.id)}
                            className={`h-6 w-6 rounded flex items-center justify-center border transition-all mx-auto ${
                              set.completed 
                                ? "bg-[#58D66D] border-[#58D66D] text-white" 
                                : "bg-secondary border-border hover:border-muted-foreground text-transparent disabled:opacity-40"
                            }`}
                          >
                            <Check className="h-4.5 w-4.5 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Instruction Modal Overlay */}
      {instructionExercise && activeInstruction && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 animate-fade-in"
          onClick={() => setInstructionExercise(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 text-left animate-scale-in relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
                <Play className="h-4 w-4 text-primary fill-current" /> {instructionExercise}
              </h3>
              <button 
                onClick={() => setInstructionExercise(null)}
                className="p-1 hover:bg-secondary/40 rounded-full transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* YouTube Iframe Player (Pull from Youtube as requested) */}
            <div className="w-full aspect-video rounded-xl bg-black overflow-hidden border border-border/40 shadow-inner relative mb-4">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeInstruction.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${activeInstruction.youtubeId}`}
                title={`${instructionExercise} instruction video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Steps Instruction list */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Instructions</p>
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeInstruction.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex gap-2 items-start text-[10px] text-muted-foreground leading-normal">
                    <span className="h-4 w-4 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => setInstructionExercise(null)}
              className="mt-5 w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default BodyPartWorkout;

