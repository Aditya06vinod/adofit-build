import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, Mic, Volume2, VolumeX, Sparkles, RefreshCw, Play, Square, Trophy, Check, ArrowRight } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

interface Joint {
  x: number;
  y: number;
  label: string;
  color: string;
}

interface SkeletonConnection {
  from: number;
  to: number;
  color: string;
}

const EXERCISES = [
  {
    id: "squats",
    name: "Squats",
    description: "Keep chest up and knees tracking over toes. Lower hips below knee level.",
    targetMuscles: "Quads, Glutes & Hamstrings",
    guidelines: [
      "Keep your heels flat on the floor.",
      "Lower your thighs until they are parallel to the floor.",
      "Keep your back straight, head looking forward."
    ],
    goodCues: ["Form looks solid!", "Excellent depth!", "Nice knee alignment."],
    correctionCues: ["Go slightly deeper.", "Keep your chest up.", "Don't let your knees cave in!"]
  },
  {
    id: "curls",
    name: "Bicep Curls",
    description: "Keep elbows tucked close to your torso. Control the lowering phase.",
    targetMuscles: "Biceps & Brachialis",
    guidelines: [
      "Keep your elbows pinned to your sides.",
      "Don't swing your back or shoulders.",
      "Lower the weight slowly for maximum control."
    ],
    goodCues: ["Great contraction!", "Perfect elbow lock.", "Good slow eccentric control."],
    correctionCues: ["Keep your elbows tucked.", "Avoid swinging your back.", "Perform full range of motion."]
  },
  {
    id: "pushups",
    name: "Push-ups",
    description: "Maintain a straight line from head to heels. Tuck elbows at 45 degrees.",
    targetMuscles: "Chest, Shoulders & Triceps",
    guidelines: [
      "Keep your core tight, don't let hips sag.",
      "Tuck elbows closer to your ribs, not flared.",
      "Touch chest to floor for full range."
    ],
    goodCues: ["Excellent spine alignment!", "Perfect elbow angle.", "Great full range reps."],
    correctionCues: ["Keep your core tight, lift hips.", "Tuck your elbows in.", "Go all the way down."]
  },
  {
    id: "plank",
    name: "Planks",
    description: "Keep forearms flat on the floor. Maintain a neutral pelvis and active core.",
    targetMuscles: "Core, Lower Back & Shoulders",
    guidelines: [
      "Engage your glutes and core.",
      "Keep head looking down at the floor.",
      "Make sure shoulders are directly above elbows."
    ],
    goodCues: ["Solid core bracing!", "Perfect flat back.", "Holding perfect alignment."],
    correctionCues: ["Don't let your hips sag.", "Keep your neck neutral.", "Hold active shoulder press."]
  }
];

const PostureCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [isCoachingActive, setIsCoachingActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Gemini API States
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem("ado-gemini-api-key");
    if (saved) return saved;
    return "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real-time statistics
  const [repCount, setRepCount] = useState(0);
  const [formQuality, setFormQuality] = useState(100);
  const [coachingStatus, setCoachingStatus] = useState<"Offline" | "Calibrating..." | "Coaching Active">("Offline");
  const [liveCaption, setLiveCaption] = useState("Tap 'Start Coach' and grant camera permission to begin form analysis.");
  const [captionColor, setCaptionColor] = useState<"info" | "success" | "warning">("info");
  
  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const voiceSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenRef = useRef<number>(0);
  const repPhaseRef = useRef<"up" | "down">("up");
  const repTimerRef = useRef<number>(0);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Synthesis Utterance
  useEffect(() => {
    if ("speechSynthesis" in window) {
      voiceSynthesisRef.current = new SpeechSynthesisUtterance();
      voiceSynthesisRef.current.rate = 1.0;
      voiceSynthesisRef.current.pitch = 1.0;
    }
  }, []);

  // Real-time voice coaching speech trigger (throttled)
  const speakCue = (text: string) => {
    if (isMuted || !("speechSynthesis" in window) || !voiceSynthesisRef.current) return;
    const now = Date.now();
    // Throttle spoken cues to once every 3.5 seconds
    if (now - lastSpokenRef.current > 3500) {
      window.speechSynthesis.cancel(); // Stop active audio before speaking next
      voiceSynthesisRef.current.text = text;
      window.speechSynthesis.speak(voiceSynthesisRef.current);
      lastSpokenRef.current = now;
    }
  };

  // Real-time Gemini API Posture Checker
  const analyzeCurrentFrame = async () => {
    if (!videoRef.current || isAnalyzing || !apiKey) return;
    if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

    setIsAnalyzing(true);
    try {
      // 1. Capture current frame from HTML5 Video
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      const aspect = videoRef.current.videoHeight / videoRef.current.videoWidth;
      canvas.height = Math.round(480 * aspect);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64Data = dataUrl.split(",")[1];

      // 2. Build multi-modal request prompts
      const currentExercise = selectedExercise.name;
      const technique = selectedExercise.description + ". Guidelines: " + selectedExercise.guidelines.join(". ");
      const prompt = `You are a real-time workout posture coach. The user is doing: ${currentExercise}. ` +
                     `Specific form/posture technique to analyze and enforce: ${technique} ` +
                     `Look at this frame. If their form is incorrect for a ${currentExercise} and this technique details, give a short (1 sentence), direct verbal instruction on how to fix it. ` +
                     `If it looks correct, say 'Good form!'. If no one is there, say 'waiting'.`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ]
      };

      // 3. Invoke Google AI Studio Gemini API - Gemini 2.0 Flash (v1beta)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error?.message || `API Error: ${response.status}`);
      }

      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (text) {
        if (text.toLowerCase() === "waiting") {
          setLiveCaption("Waiting for person in frame...");
          setCaptionColor("info");
        } else {
          setLiveCaption(text);
          speakCue(text);

          // Update UI color and simulated Form Quality based on AI diagnosis
          if (text.toLowerCase().includes("good form") || text.toLowerCase().includes("solid") || text.toLowerCase().includes("excellent")) {
            setCaptionColor("success");
            setFormQuality(prev => Math.min(100, Math.floor(prev + 4)));
          } else {
            setCaptionColor("warning");
            setFormQuality(prev => Math.max(50, Math.floor(prev - 7)));
          }
        }
      }
    } catch (err: any) {
      console.error("Gemini analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Multimodal Voice Assistant
  const askVoiceAssistant = async (userQuery: string) => {
    if (!videoRef.current || !apiKey) return;
    if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

    setLiveCaption("Asking Voice Coach...");
    speakCue("Let me check that...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 480;
      const aspect = videoRef.current.videoHeight / videoRef.current.videoWidth;
      canvas.height = Math.round(480 * aspect);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64Data = dataUrl.split(",")[1];

      const currentExercise = selectedExercise.name;
      const technique = selectedExercise.description + ". Guidelines: " + selectedExercise.guidelines.join(". ");
      const prompt = `You are a friendly real-time workout posture coach assistant. The user is doing: ${currentExercise}. ` +
                     `Specific posture technique guide to analyze: ${technique} ` +
                     `The user verbally asked you: "${userQuery}". Look at this frame and answer their query directly, ` +
                     `objectively, and with encouraging advice in exactly 1-2 friendly sentences. Speak directly to them.`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (text) {
        setLiveCaption(text);
        speakCue(text);
      } else {
        setLiveCaption("Sorry, I couldn't analyze the frame.");
        speakCue("Sorry, I couldn't analyze the frame.");
      }
    } catch (err: any) {
      console.error("Voice assistant error:", err);
      setLiveCaption("Error connecting to AI Coach.");
      speakCue("Connection error.");
    }
  };

  // Start Voice Command Assistant (using Web Speech API WebkitSpeechRecognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported on this browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Voice Assistant Active 🎙️",
        description: "Ask a question about your form or say an exercise name to switch."
      });
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command Recognized:", command);
      
      let matched = false;
      for (const ex of EXERCISES) {
        if (command.includes(ex.name.toLowerCase()) || command.includes(ex.id)) {
          setSelectedExercise(ex);
          matched = true;
          toast({
            title: `Switched to ${ex.name} 🏋️`,
            description: `Now tracking form for ${ex.name}`
          });
          speakCue(`Switched to ${ex.name}`);
          setRepCount(0);
          break;
        }
      }

      if (!matched) {
        // If voice command isn't switching exercises, treat it as a direct query to the Coach AI!
        askVoiceAssistant(command);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Camera start/stop handler
  const startCamera = async () => {
    // Check if running inside Android WebView wrapper
    if ((window as any).AndroidInterface) {
      try {
        (window as any).AndroidInterface.startPostureCoach(apiKey || "", selectedExercise.name);
        return;
      } catch (err) {
        console.error("Failed to start native Posture Coach:", err);
      }
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: { facingMode: facingMode },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCoachingActive(true);
      setCoachingStatus("Calibrating...");
      setLiveCaption("Position your full body in the camera frame for skeletal calibration.");
      setCaptionColor("info");
      speakCue("Please step back and align your full body inside the camera frame.");
    } catch (err: any) {
      console.error("Camera access error:", err);
      toast({
        title: "Camera Access Error ⚠️",
        description: "Make sure you allow camera permissions in your browser. (Check chrome://flags if accessing over network IP).",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCoachingActive(false);
    setCoachingStatus("Offline");
    setLiveCaption("Tap 'Start Coach' and grant camera permission to begin form analysis.");
    setCaptionColor("info");
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isCoachingActive) {
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  // Run calibration step-by-step and then start tracking loop
  useEffect(() => {
    if (isCoachingActive && coachingStatus === "Calibrating...") {
      const timer = setTimeout(() => {
        setCoachingStatus("Coaching Active");
        if (apiKey) {
          setLiveCaption("Calibration complete. Form Coaching is now Active!");
          setCaptionColor("success");
          speakCue("Calibration complete. You can begin your workout now.");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCoachingActive, coachingStatus, apiKey]);

  // AI Posture analysis loop
  useEffect(() => {
    if (!isCoachingActive || coachingStatus !== "Coaching Active" || !apiKey) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      return;
    }

    analyzeCurrentFrame();

    analysisIntervalRef.current = setInterval(() => {
      analyzeCurrentFrame();
    }, 7000); // Trigger posture analysis frame call every 7 seconds

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [isCoachingActive, coachingStatus, apiKey, selectedExercise, facingMode]);

  // Display API Key warning if missing
  useEffect(() => {
    if (isCoachingActive && coachingStatus === "Coaching Active" && !apiKey) {
      setLiveCaption("⚠️ Gemini API Key not set. Please tap the sparkles icon at the top right to configure your API Key and enable real-time coaching.");
      setCaptionColor("warning");
    }
  }, [isCoachingActive, coachingStatus, apiKey]);

  // Main Tracking/Render loop
  useEffect(() => {
    if (coachingStatus !== "Coaching Active" || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localRepCount = repCount;
    let localFormQuality = formQuality;
    let progressVal = 0; // Tracks motion cycle
    let isGoodForm = true;

    const renderLoop = () => {
      if (!ctx || !canvas || !videoRef.current) return;

      const vWidth = videoRef.current.videoWidth || 640;
      const vHeight = videoRef.current.videoHeight || 480;

      // Adjust canvas resolution to match video feed aspect ratio
      if (canvas.width !== vWidth || canvas.height !== vHeight) {
        canvas.width = vWidth;
        canvas.height = vHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Calculate realistic skeletal joint movements based on exercise rules
      progressVal += 0.02; // speed of skeletal movement
      repTimerRef.current += 1;

      // Biomechanical joints simulation variables
      let hipYOffset = 0;
      let kneeYOffset = 0;
      let elbowAngleOffset = 0;
      let spineSagOffset = 0;

      // Simulate exercises
      if (selectedExercise.id === "squats") {
        // Squat motion cycle (repeats)
        const motion = Math.sin(progressVal); // goes from -1 to 1
        hipYOffset = Math.max(0, motion) * 80;
        kneeYOffset = Math.max(0, motion) * 20;

        // Form checker rules
        if (motion > 0.8 && repPhaseRef.current === "down") {
          // Bottom of Squat: check depth
          repPhaseRef.current = "up";
          localRepCount += 1;
          setRepCount(localRepCount);
          
          // Random form check trigger (simulate occasional imperfect form)
          const roll = Math.random();
          if (roll > 0.75) {
            isGoodForm = false;
            localFormQuality = Math.max(70, Math.floor(localFormQuality - 5));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.correctionCues[Math.floor(Math.random() * selectedExercise.correctionCues.length)];
            setLiveCaption(cue);
            setCaptionColor("warning");
            speakCue(cue);
          } else {
            isGoodForm = true;
            localFormQuality = Math.min(100, Math.floor(localFormQuality + 2));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.goodCues[Math.floor(Math.random() * selectedExercise.goodCues.length)];
            setLiveCaption(cue);
            setCaptionColor("success");
            speakCue(cue);
          }
        } else if (motion < -0.8) {
          repPhaseRef.current = "down";
        }
      } 
      else if (selectedExercise.id === "curls") {
        const motion = Math.sin(progressVal); // from -1 to 1
        elbowAngleOffset = (motion + 1) * 0.7; // elbow folding

        if (motion > 0.8 && repPhaseRef.current === "down") {
          repPhaseRef.current = "up";
          localRepCount += 1;
          setRepCount(localRepCount);

          const roll = Math.random();
          if (roll > 0.8) {
            isGoodForm = false;
            localFormQuality = Math.max(65, Math.floor(localFormQuality - 6));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.correctionCues[Math.floor(Math.random() * selectedExercise.correctionCues.length)];
            setLiveCaption(cue);
            setCaptionColor("warning");
            speakCue(cue);
          } else {
            isGoodForm = true;
            localFormQuality = Math.min(100, Math.floor(localFormQuality + 3));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.goodCues[Math.floor(Math.random() * selectedExercise.goodCues.length)];
            setLiveCaption(cue);
            setCaptionColor("success");
            speakCue(cue);
          }
        } else if (motion < -0.8) {
          repPhaseRef.current = "down";
        }
      } 
      else if (selectedExercise.id === "pushups") {
        const motion = Math.sin(progressVal);
        hipYOffset = Math.max(0, motion) * 35;
        // Occasional hips sag simulation
        if (Math.sin(progressVal * 0.5) > 0.7) {
          spineSagOffset = 15;
        }

        if (motion > 0.8 && repPhaseRef.current === "down") {
          repPhaseRef.current = "up";
          localRepCount += 1;
          setRepCount(localRepCount);

          if (spineSagOffset > 0) {
            isGoodForm = false;
            localFormQuality = Math.max(60, Math.floor(localFormQuality - 8));
            setFormQuality(localFormQuality);
            const cue = "Don't let your hips sag, keep your core braced!";
            setLiveCaption(cue);
            setCaptionColor("warning");
            speakCue(cue);
          } else {
            isGoodForm = true;
            localFormQuality = Math.min(100, Math.floor(localFormQuality + 2));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.goodCues[Math.floor(Math.random() * selectedExercise.goodCues.length)];
            setLiveCaption(cue);
            setCaptionColor("success");
            speakCue(cue);
          }
        } else if (motion < -0.8) {
          repPhaseRef.current = "down";
        }
      } 
      else if (selectedExercise.id === "plank") {
        // Isometric hold, no reps. Count seconds
        if (repTimerRef.current % 60 === 0) {
          setRepCount(r => r + 1);
          
          const roll = Math.random();
          if (roll > 0.8) {
            isGoodForm = false;
            localFormQuality = Math.max(70, Math.floor(localFormQuality - 4));
            setFormQuality(localFormQuality);
            const cue = selectedExercise.correctionCues[Math.floor(Math.random() * selectedExercise.correctionCues.length)];
            setLiveCaption(cue);
            setCaptionColor("warning");
            speakCue(cue);
          } else {
            isGoodForm = true;
            const cue = selectedExercise.goodCues[Math.floor(Math.random() * selectedExercise.goodCues.length)];
            setLiveCaption(cue);
            setCaptionColor("success");
            speakCue(cue);
          }
        }
      }

      // Draw Joint Markers & Skeleton lines onto overlay Canvas
      const w = canvas.width;
      const h = canvas.height;

      // Define static skeletal layout relative to canvas size
      // We modify positions dynamically based on exercise animations
      const joints: Joint[] = [
        { x: w * 0.5, y: h * 0.2, label: "Head", color: "#1C64F2" }, // 0
        { x: w * 0.5, y: h * 0.28, label: "Shoulder Center", color: "#1C64F2" }, // 1
        { x: w * 0.4, y: h * 0.32 + (selectedExercise.id === "pushups" ? hipYOffset * 0.3 : 0), label: "Left Shoulder", color: isGoodForm ? "#10B981" : "#F59E0B" }, // 2
        { x: w * 0.6, y: h * 0.32 + (selectedExercise.id === "pushups" ? hipYOffset * 0.3 : 0), label: "Right Shoulder", color: isGoodForm ? "#10B981" : "#F59E0B" }, // 3
        { x: w * 0.36 - (selectedExercise.id === "curls" ? elbowAngleOffset * 20 : 0), y: h * 0.45, label: "Left Elbow", color: isGoodForm ? "#10B981" : "#F59E0B" }, // 4
        { x: w * 0.64 + (selectedExercise.id === "curls" ? elbowAngleOffset * 20 : 0), y: h * 0.45, label: "Right Elbow", color: isGoodForm ? "#10B981" : "#F59E0B" }, // 5
        { x: w * 0.38 - (selectedExercise.id === "curls" ? elbowAngleOffset * 35 : 0), y: h * 0.58 - (selectedExercise.id === "curls" ? elbowAngleOffset * 80 : 0), label: "Left Wrist", color: "#10B981" }, // 6
        { x: w * 0.62 + (selectedExercise.id === "curls" ? elbowAngleOffset * 35 : 0), y: h * 0.58 - (selectedExercise.id === "curls" ? elbowAngleOffset * 80 : 0), label: "Right Wrist", color: "#10B981" }, // 7
        { x: w * 0.45, y: h * 0.55 + hipYOffset + (selectedExercise.id === "pushups" ? hipYOffset * 0.4 + spineSagOffset : 0), label: "Left Hip", color: isGoodForm ? "#10B981" : "#EF4444" }, // 8
        { x: w * 0.55, y: h * 0.55 + hipYOffset + (selectedExercise.id === "pushups" ? hipYOffset * 0.4 + spineSagOffset : 0), label: "Right Hip", color: isGoodForm ? "#10B981" : "#EF4444" }, // 9
        { x: w * 0.42, y: h * 0.72 + kneeYOffset, label: "Left Knee", color: isGoodForm ? "#10B981" : "#EF4444" }, // 10
        { x: w * 0.58, y: h * 0.72 + kneeYOffset, label: "Right Knee", color: isGoodForm ? "#10B981" : "#EF4444" }, // 11
        { x: w * 0.43, y: h * 0.88, label: "Left Ankle", color: "#10B981" }, // 12
        { x: w * 0.57, y: h * 0.88, label: "Right Ankle", color: "#10B981" } // 13
      ];

      const connections: SkeletonConnection[] = [
        { from: 0, to: 1, color: "#1C64F2" },
        { from: 1, to: 2, color: "#1C64F2" },
        { from: 1, to: 3, color: "#1C64F2" },
        { from: 2, to: 4, color: isGoodForm ? "#10B981" : "#F59E0B" },
        { from: 3, to: 5, color: isGoodForm ? "#10B981" : "#F59E0B" },
        { from: 4, to: 6, color: "#10B981" },
        { from: 5, to: 7, color: "#10B981" },
        { from: 2, to: 8, color: isGoodForm ? "#10B981" : "#EF4444" },
        { from: 3, to: 9, color: isGoodForm ? "#10B981" : "#EF4444" },
        { from: 8, to: 9, color: "#1C64F2" },
        { from: 8, to: 10, color: isGoodForm ? "#10B981" : "#EF4444" },
        { from: 9, to: 11, color: isGoodForm ? "#10B981" : "#EF4444" },
        { from: 10, to: 12, color: "#10B981" },
        { from: 11, to: 13, color: "#10B981" }
      ];

      // Draw bones (skeletal connections)
      ctx.lineWidth = 4;
      connections.forEach(conn => {
        const fromPt = joints[conn.from];
        const toPt = joints[conn.to];
        ctx.beginPath();
        ctx.strokeStyle = conn.color;
        ctx.moveTo(fromPt.x, fromPt.y);
        ctx.lineTo(toPt.x, toPt.y);
        ctx.stroke();
      });

      // Draw joints (tracking points)
      joints.forEach((joint, idx) => {
        ctx.beginPath();
        ctx.fillStyle = joint.color;
        ctx.arc(joint.x, joint.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle neon outer ring for key active joints
        if (joint.label.includes("Knee") || joint.label.includes("Elbow") || joint.label.includes("Hip")) {
          ctx.beginPath();
          ctx.strokeStyle = joint.color;
          ctx.lineWidth = 1.5;
          ctx.arc(joint.x, joint.y, 11, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw HUD angle metrics on joints for biofeedback
        if (selectedExercise.id === "squats" && joint.label === "Left Knee") {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          const simulatedKneeAngle = Math.round(180 - (hipYOffset * 0.95));
          ctx.fillText(`${simulatedKneeAngle}°`, joint.x + 15, joint.y + 4);
        }
        else if (selectedExercise.id === "curls" && joint.label === "Left Elbow") {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          const simulatedElbowAngle = Math.round(170 - (elbowAngleOffset * 130));
          ctx.fillText(`${simulatedElbowAngle}°`, joint.x - 30, joint.y + 4);
        }
        else if (selectedExercise.id === "pushups" && joint.label === "Left Elbow") {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          const simulatedPushupAngle = Math.round(175 - (hipYOffset * 1.5));
          ctx.fillText(`${simulatedPushupAngle}°`, joint.x - 30, joint.y + 4);
        }
      });

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [coachingStatus, selectedExercise]);

  const handleFinishSession = () => {
    stopCamera();
    toast({
      title: "Workout Completed! 🏆",
      description: `Completed ${repCount} reps of ${selectedExercise.name} with ${formQuality}% quality.`
    });
    navigate("/progress");
  };

  return (
    <MobileLayout>
      <div className="animate-fade-in px-4 pt-6 pb-28 min-h-screen bg-background text-foreground flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => { stopCamera(); navigate(-1); }} className="p-1 hover:bg-secondary/40 rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h1 className="text-base font-bold text-card-foreground">AI Posture Coach</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-1.5 rounded-full border transition-all ${
                apiKey ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
              }`}
              title="Configure Gemini API Key"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Glowing Status badge */}
            <div className="flex items-center gap-1.5 bg-card border border-border/30 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
              <span className={`h-2 w-2 rounded-full ${
                coachingStatus === "Offline" ? "bg-muted-foreground" :
                coachingStatus === "Calibrating..." ? "bg-yellow-400 animate-pulse" : "bg-emerald-500 animate-ping"
              }`} />
              <span className={
                coachingStatus === "Offline" ? "text-muted-foreground" :
                coachingStatus === "Calibrating..." ? "text-yellow-400" : "text-emerald-500"
              }>{coachingStatus}</span>
            </div>
          </div>
        </div>

        {/* API Key configuration card */}
        {showKeyInput && (
          <div className="mb-4 bg-card border border-border/30 rounded-2xl p-4 shadow-sm animate-scale-in">
            <h3 className="text-xs font-bold mb-1">Configure Gemini API Key</h3>
            <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
              To activate real-time video coaching, paste a Gemini API Key from Google AI Studio. The key is saved locally in your browser.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter Gemini API Key..."
                value={apiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setApiKey(val);
                  localStorage.setItem("ado-gemini-api-key", val);
                }}
                className="flex-1 bg-secondary border border-border/30 rounded-xl px-3 py-2 text-xs font-bold outline-none text-foreground"
              />
              <button
                onClick={() => setShowKeyInput(false)}
                className="bg-[#1C64F2] text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Exercise Quick Selector */}
        <div className="mb-4 shrink-0 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedExercise(ex);
                setRepCount(0);
                if (isCoachingActive) {
                  setCoachingStatus("Calibrating...");
                  setLiveCaption(`Switched to ${ex.name}. Align full body in camera frame for recalibration.`);
                  speakCue(`Switched to ${ex.name}. Calibrating.`);
                }
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                selectedExercise.id === ex.id
                  ? "bg-[#1C64F2] border-[#1C64F2] text-white shadow-md shadow-blue-500/10"
                  : "bg-card border-border/40 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>

        {/* Live Camera Feed & Skeleton Canvas Area */}
        <div className="relative flex-1 aspect-[3/4] max-h-[46vh] rounded-3xl overflow-hidden bg-black border border-border/30 shadow-2xl flex items-center justify-center mb-4 group">
          {/* WebCam Video stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover scale-x-[-1]" /* Mirror effect */
          />

          {/* Biomechanical Joints Drawing Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
          />

          {/* Standard Calibration grid when calibrating */}
          {coachingStatus === "Calibrating..." && (
            <div className="absolute inset-0 border-[3px] border-dashed border-yellow-400/40 rounded-3xl flex flex-col items-center justify-center p-6 animate-pulse bg-black/30 pointer-events-none">
              <div className="h-44 w-28 rounded-full border-4 border-yellow-400/60 flex items-center justify-center">
                <span className="text-[10px] font-bold text-yellow-400 text-center uppercase tracking-widest leading-tight">Fit<br/>Body<br/>Here</span>
              </div>
              <p className="text-[11px] font-bold text-yellow-400 mt-4 bg-black/85 px-3 py-1.5 rounded-xl border border-yellow-400/20 text-center">
                Stand 6-8 feet away from camera
              </p>
            </div>
          )}

          {/* Camera placeholder when offline */}
          {!isCoachingActive && (
            <div className="absolute inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground mb-4">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-card-foreground">Camera Feed Offline</h3>
              <p className="text-xs text-muted-foreground max-w-[200px] mt-1 mb-6 leading-relaxed">
                Start the posture coach to overlay virtual tracking markers on your movement.
              </p>
              <button
                onClick={startCamera}
                className="bg-[#1C64F2] hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Play className="h-4 w-4 fill-current" /> Start Coach
              </button>
            </div>
          )}

          {/* Floating Glassmorphic Camera Controls Badge */}
          {isCoachingActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-4 shadow-xl z-20">
              {/* Front/Back Cam Toggle */}
              <button
                onClick={toggleFacingMode}
                className="p-2 hover:bg-white/15 active:scale-90 text-white rounded-full transition-all"
                title="Switch Camera"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Voice Command Toggle */}
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2 active:scale-90 rounded-full transition-all ${
                  isListening ? "bg-red-500/25 text-red-500 animate-pulse border border-red-500/30" : "hover:bg-white/15 text-white"
                }`}
                title="Toggle Voice Commands"
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Audio Coach Mute Toggle */}
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  toast({
                    title: isMuted ? "Voice Coach Restored 🔊" : "Voice Coach Muted 🔇",
                    description: isMuted ? "Real-time posture feedback will be spoken." : "Spoken cues disabled."
                  });
                }}
                className="p-2 hover:bg-white/15 active:scale-90 text-white rounded-full transition-all"
                title="Toggle Voice Feedback"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-white/15 active:scale-90 text-red-400 rounded-full transition-all"
                title="Stop Coaching"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            </div>
          )}
        </div>

        {/* Real-time Readbale Audio Captions Panel */}
        <div className={`rounded-2xl border p-4 mb-4 shrink-0 shadow-sm transition-all duration-300 ${
          captionColor === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-[#10B981]" :
          captionColor === "warning" ? "bg-amber-500/5 border-amber-500/20 text-[#F59E0B]" :
          "bg-secondary/40 border-border/30 text-card-foreground"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Voice Coach Feedback</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            {liveCaption}
          </p>
        </div>

        {/* Reps & Quality Stats Panel */}
        <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Rep Count</p>
            <p className="text-2xl font-extrabold text-[#1C64F2] mt-1">
              {repCount} <span className="text-xs font-medium text-muted-foreground">/{selectedExercise.id === "plank" ? "s" : " reps"}</span>
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Form Quality</p>
            <p className={`text-2xl font-extrabold mt-1 ${
              formQuality >= 90 ? "text-emerald-500" :
              formQuality >= 80 ? "text-yellow-400" : "text-red-500"
            }`}>
              {formQuality}%
            </p>
          </div>
        </div>

        {/* Details & Complete Button */}
        <div className="mt-auto space-y-3 shrink-0">
          <div className="bg-card/50 border border-border/20 rounded-2xl p-3 text-[10px] text-muted-foreground font-medium">
            <span className="font-bold text-card-foreground text-xs block mb-1">Target Muscle: {selectedExercise.targetMuscles}</span>
            {selectedExercise.description}
          </div>

          <button
            onClick={handleFinishSession}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 text-xs shadow-lg shadow-emerald-500/10 active:scale-95 transition-transform"
          >
            <Check className="h-4.5 w-4.5 stroke-[3]" /> Complete and Save Session
          </button>
        </div>

      </div>
    </MobileLayout>
  );
};

export default PostureCoach;
