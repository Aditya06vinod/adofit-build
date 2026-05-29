package com.example.adoworkoutapp

import android.app.Application
import android.graphics.Bitmap
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.adoworkoutapp.camera.NormalizedLandmark
import com.example.adoworkoutapp.network.Content
import com.example.adoworkoutapp.network.GenerateContentRequest
import com.example.adoworkoutapp.network.InlineData
import com.example.adoworkoutapp.network.Part
import com.example.adoworkoutapp.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream
import java.util.Locale

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing = _isAnalyzing.asStateFlow()
    
    private val _postureFeedback = MutableStateFlow("Select an exercise and tap Start.")
    val postureFeedback = _postureFeedback.asStateFlow()

    private val _exerciseName = MutableStateFlow("Sumo Squat")
    val exerciseName = _exerciseName.asStateFlow()
    
    private val _isFrontCamera = MutableStateFlow(true)
    val isFrontCamera = _isFrontCamera.asStateFlow()

    private val _poseLandmarks = MutableStateFlow<List<NormalizedLandmark>>(emptyList())
    val poseLandmarks = _poseLandmarks.asStateFlow()

    private val _frameWidth = MutableStateFlow(480f)
    val frameWidth = _frameWidth.asStateFlow()

    private val _frameHeight = MutableStateFlow(640f)
    val frameHeight = _frameHeight.asStateFlow()

    private val _repCount = MutableStateFlow(0)
    val repCount = _repCount.asStateFlow()

    private val _isSetComplete = MutableStateFlow(false)
    val isSetComplete = _isSetComplete.asStateFlow()

    private var repState = RepState.IDLE
    private var baselineY: Float? = null

    private enum class RepState { IDLE, DOWN, UP }

    private val exerciseTechniques = mapOf(
        "Sumo Squat" to "Feet wider than shoulder-width, toes turned outward ~45 degrees, back straight/neutral spine, hips sink back and down, knees track directly over toes, thighs parallel to floor.",
        "Push Ups" to "Body in straight line from head to heels, core tight, hands under shoulders, elbows angled back at 45 degrees, chest goes almost to the floor.",
        "Lunges" to "Torso upright/vertical, step forward, front knee aligned directly above ankle at 90 degrees, back knee hovering just above floor.",
        "Plank" to "Forearms flat on floor, elbows directly under shoulders, straight line from head to heels, neutral hips (no sagging or raising), core squeezed.",
        "Overhead Press" to "Stand upright, press hands straight up to lock elbows overhead, engage shoulders, keep spine neutral without excessive arching of low back.",
        "Deadlift" to "Hip hinge, flat neutral spine/back, knees slightly bent, chest up, bar close to shins/legs throughout lift, drive through feet."
    )

    private var tts: TextToSpeech? = null
    private var lastAnalysisTime = 0L
    private val analysisIntervalMs = 20000L

    private var isCallingApi = false
    private var lastActiveBitmap: Bitmap? = null

    init {
        tts = TextToSpeech(application) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.US
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        tts?.stop()
        tts?.shutdown()
    }
    
    fun setExerciseName(name: String) {
        _exerciseName.value = name
        _repCount.value = 0
        repState = RepState.IDLE
        baselineY = null
    }

    fun toggleCamera() {
        _isFrontCamera.value = !_isFrontCamera.value
    }

    fun updatePose(landmarks: List<NormalizedLandmark>, width: Float, height: Float) {
        _poseLandmarks.value = landmarks
        _frameWidth.value = width
        _frameHeight.value = height

        if (_isAnalyzing.value) {
            trackReps(landmarks)
        }
    }

    private fun trackReps(landmarks: List<NormalizedLandmark>) {
        val landmarksMap = landmarks.associateBy { it.type }
        val currentExercise = _exerciseName.value

        val targetLandmark = when (currentExercise) {
            "Sumo Squat", "Lunges", "Deadlift" -> landmarksMap[23] ?: landmarksMap[24]
            "Push Ups", "Plank" -> landmarksMap[11] ?: landmarksMap[12]
            "Overhead Press" -> landmarksMap[15] ?: landmarksMap[16]
            else -> null
        } 

        if (targetLandmark == null) {
            return
        }

        val currentY = targetLandmark.y
        val threshold = 0.04f

        if (baselineY == null) {
            baselineY = currentY
            return
        }

        val diff = currentY - (baselineY!!)

        when (currentExercise) {
            "Sumo Squat", "Lunges", "Deadlift", "Push Ups", "Plank" -> {
                if (repState == RepState.IDLE && diff > threshold) {
                    repState = RepState.DOWN
                } else if (repState == RepState.DOWN && diff < threshold / 3) {
                    incrementRep()
                    repState = RepState.IDLE
                    baselineY = currentY 
                }
            }
            "Overhead Press" -> {
                if (repState == RepState.IDLE && diff < -threshold) {
                    repState = RepState.UP
                } else if (repState == RepState.UP && diff > -threshold / 3) {
                    incrementRep()
                    repState = RepState.IDLE
                    baselineY = currentY
                }
            }
        }
        
        if (repState == RepState.IDLE && Math.abs(diff) < 0.01f) {
            baselineY = (baselineY!! * 0.95f) + (currentY * 0.05f)
        }
    }

    private fun incrementRep() {
        _repCount.value += 1
        if (_repCount.value >= 6) {
            _isSetComplete.value = true
            _repCount.value = 0
            speak("Great set! Take a rest.")
        }
    }

    fun resetSetComplete() {
        _isSetComplete.value = false
    }

    fun toggleAnalysis() {
        _isAnalyzing.value = !_isAnalyzing.value
        if (_isAnalyzing.value) {
            _postureFeedback.value = "Starting analysis for ${_exerciseName.value}..."
            speak("Let's do ${_exerciseName.value}.")
            _repCount.value = 0
            repState = RepState.IDLE
            baselineY = null
        } else {
            _postureFeedback.value = "Coaching paused."
            speak("Coaching paused.")
        }
    }

    fun processFrame(bitmap: Bitmap) {
        lastActiveBitmap = bitmap
        if (!_isAnalyzing.value) return
        
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastAnalysisTime < analysisIntervalMs) return
        
        if (isCallingApi) return
        
        lastAnalysisTime = currentTime
        analyzePosture(bitmap)
    }

    private var customApiKey: String? = null

    fun setCustomApiKey(key: String) {
        customApiKey = key
    }

    private fun getApiKey(): String {
        customApiKey?.let {
            if (it.isNotEmpty()) return it
        }
        return try {
            val packageName = getApplication<Application>().packageName
            val buildConfigClass = Class.forName("$packageName.BuildConfig")
            val field = buildConfigClass.getField("GEMINI_API_KEY")
            field.get(null) as? String ?: ""
        } catch (e: Exception) {
            ""
        }
    }

    fun askVoiceAssistant(userQuery: String) {
        val bitmap = lastActiveBitmap
        if (bitmap == null) {
            _postureFeedback.value = "Voice assistant: Camera frame not ready yet."
            speak("I can't see you yet. Please point the camera towards yourself.")
            return
        }
        
        _postureFeedback.value = "Asking Voice Coach..."
        speak("Let me check...")
        isCallingApi = true
        
        viewModelScope.launch {
            try {
                val scaledWidth = 480
                val scaledHeight = (bitmap.height.toFloat() / bitmap.width.toFloat() * scaledWidth).toInt()
                val scaledBitmap = Bitmap.createScaledBitmap(bitmap, scaledWidth, scaledHeight, true)
                val base64Image = scaledBitmap.toBase64()
                
                val currentExercise = _exerciseName.value
                val technique = exerciseTechniques[currentExercise] ?: "Ensure proper body alignment."
                val prompt = "You are a friendly real-time workout posture coach assistant. The user is doing: $currentExercise. " +
                        "Specific posture technique guide to analyze: $technique " +
                        "The user verbally asked you: \"$userQuery\". Look at this frame and answer their query directly, " +
                        "objectively, and with encouraging advice in exactly 1-2 friendly sentences. Speak directly to them."

                val request = GenerateContentRequest(
                    contents = listOf(
                        Content(
                            parts = listOf(
                                Part(text = prompt),
                                Part(inlineData = InlineData(mimeType = "image/jpeg", data = base64Image))
                            )
                        )
                    )
                )

                val apiKey = getApiKey()
                if (apiKey.isEmpty() || apiKey.contains("MY_GEMINI_API_KEY") || apiKey.contains("PLACEHOLDER")) {
                    _postureFeedback.value = "Please configure Gemini API Key in AI Studio Secrets."
                    isCallingApi = false
                    return@launch
                }

                val response = RetrofitClient.service.generateContent(apiKey, request)
                val text = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text?.trim() ?: ""
                
                if (text.isNotEmpty()) {
                    _postureFeedback.value = text
                    speak(text)
                } else {
                    _postureFeedback.value = "Sorry, I couldn't get a response."
                    speak("Sorry, I didn't catch that description.")
                }

            } catch (e: Exception) {
                Log.e("VoiceAssistantError", "Error calling Gemini", e)
                val errorMessage = when (e) {
                    is java.net.UnknownHostException -> "No internet connection."
                    is retrofit2.HttpException -> "AI Service Error: ${e.code()}"
                    else -> "Error connecting to AI: ${e.message}"
                }
                _postureFeedback.value = errorMessage
                speak("Connection error.")
            } finally {
                isCallingApi = false
            }
        }
    }

    private fun analyzePosture(bitmap: Bitmap) {
        isCallingApi = true
        _postureFeedback.value = "Analyzing..."
        viewModelScope.launch {
            try {
                val scaledWidth = 480
                val scaledHeight = (bitmap.height.toFloat() / bitmap.width.toFloat() * scaledWidth).toInt()
                val scaledBitmap = Bitmap.createScaledBitmap(bitmap, scaledWidth, scaledHeight, true)
                val base64Image = scaledBitmap.toBase64()
                
                val currentExercise = _exerciseName.value
                val technique = exerciseTechniques[currentExercise] ?: "Ensure proper alignment."
                val prompt = "You are a real-time workout posture coach. The user is doing: $currentExercise. " +
                        "Specific form/posture technique to analyze and enforce: $technique " +
                        "Look at this frame. If their form is incorrect for a $currentExercise and this technique details, give a short (1 sentence), direct verbal instruction on how to fix it. " +
                        "If it looks correct, say 'Good form!'. If no one is there, say 'waiting'."

                val request = GenerateContentRequest(
                    contents = listOf(
                        Content(
                            parts = listOf(
                                Part(text = prompt),
                                Part(inlineData = InlineData(mimeType = "image/jpeg", data = base64Image))
                            )
                        )
                    )
                )

                val apiKey = getApiKey()
                if (apiKey.isEmpty() || apiKey.contains("MY_GEMINI_API_KEY") || apiKey.contains("PLACEHOLDER")) {
                    _postureFeedback.value = "Please configure Gemini API Key in AI Studio Secrets."
                    isCallingApi = false
                    return@launch
                }

                val response = RetrofitClient.service.generateContent(apiKey, request)
                val text = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text?.trim() ?: ""
                
                if (text.isNotEmpty() && !text.equals("waiting", ignoreCase = true)) {
                    _postureFeedback.value = text
                    speak(text)
                } else if (text.equals("waiting", ignoreCase = true)) {
                    _postureFeedback.value = "Waiting for exercise..."
                } else {
                    _postureFeedback.value = "Monitoring..."
                }

            } catch (e: Exception) {
                Log.e("GeminiError", "Error calling Gemini", e)
                val errorMessage = when (e) {
                    is java.net.UnknownHostException -> "No internet connection."
                    is retrofit2.HttpException -> "AI Service Error: ${e.code()}"
                    else -> "Error connecting to AI: ${e.message}"
                }
                _postureFeedback.value = errorMessage
            } finally {
                isCallingApi = false
            }
        }
    }

    private fun speak(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }

    private fun Bitmap.toBase64(): String {
        val outputStream = ByteArrayOutputStream()
        compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
        return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
    }
}
