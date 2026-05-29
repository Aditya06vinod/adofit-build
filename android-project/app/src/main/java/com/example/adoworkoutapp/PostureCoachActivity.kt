package com.example.adoworkoutapp

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.FlipCameraAndroid
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import kotlinx.coroutines.delay
import nl.dionsegijn.konfetti.compose.KonfettiView
import nl.dionsegijn.konfetti.core.Party
import nl.dionsegijn.konfetti.core.Position
import nl.dionsegijn.konfetti.core.emitter.Emitter
import java.util.concurrent.TimeUnit
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.adoworkoutapp.camera.NormalizedLandmark
import com.example.adoworkoutapp.camera.bindCameraUseCases
import com.example.adoworkoutapp.theme.AdoWorkoutAppTheme

class PostureCoachActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val apiKey = intent.getStringExtra("GEMINI_API_KEY") ?: ""
        val exerciseName = intent.getStringExtra("EXERCISE_NAME") ?: ""
        setContent {
            AdoWorkoutAppTheme {
                val viewModel: MainViewModel = viewModel()
                if (apiKey.isNotEmpty()) {
                    viewModel.setCustomApiKey(apiKey)
                }
                if (exerciseName.isNotEmpty()) {
                    viewModel.setExerciseName(exerciseName)
                }
                PostureCoachApp(viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalComposeUiApi::class)
@Composable
fun PostureCoachApp(viewModel: MainViewModel = viewModel()) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val focusManager = LocalFocusManager.current
    
    val isAnalyzing by viewModel.isAnalyzing.collectAsState()
    val feedback by viewModel.postureFeedback.collectAsState()
    val exerciseName by viewModel.exerciseName.collectAsState()
    val isFrontCamera by viewModel.isFrontCamera.collectAsState()
    val poseLandmarks by viewModel.poseLandmarks.collectAsState()
    val repCount by viewModel.repCount.collectAsState()
    val isSetComplete by viewModel.isSetComplete.collectAsState()

    val haptic = LocalHapticFeedback.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted ->
            hasCameraPermission = granted
        }
    )

    // Speech Recognizers
    val exerciseSpeechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult(),
        onResult = { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val data = result.data
                val results = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                val spokenText = results?.firstOrNull()
                if (!spokenText.isNullOrBlank()) {
                    viewModel.setExerciseName(spokenText)
                }
            }
        }
    )

    val assistantSpeechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult(),
        onResult = { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val data = result.data
                val results = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                val spokenText = results?.firstOrNull()
                if (!spokenText.isNullOrBlank()) {
                    viewModel.askVoiceAssistant(spokenText)
                }
            }
        }
    )

    val exerciseSpeechIntent = remember {
        Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Say the exercise (e.g. Sumo Squat, Push Ups)")
        }
    }

    val assistantSpeechIntent = remember {
        Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Ask Coach (e.g., Is my back straight?)")
        }
    }

    // Infinite pulsing animation for Live indicator
    val infiniteTransition = rememberInfiniteTransition()
    val dotAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    // Handle Set Completion: Haptic, Sound, Confetti
    LaunchedEffect(isSetComplete) {
        if (isSetComplete) {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            delay(3000)
            viewModel.resetSetComplete()
        }
    }

    // Handle Rep Count Haptic
    LaunchedEffect(repCount) {
        if (repCount > 0) {
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Exercise Dropdown Selector
            var dropdownExpanded by remember { mutableStateOf(false) }
            val exercises = listOf("Sumo Squat", "Push Ups", "Lunges", "Plank", "Overhead Press", "Deadlift")
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                OutlinedTextField(
                    value = exerciseName,
                    onValueChange = {},
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false,
                    colors = OutlinedTextFieldDefaults.colors(
                        disabledTextColor = MaterialTheme.colorScheme.onSurface,
                        disabledBorderColor = MaterialTheme.colorScheme.outlineVariant,
                        disabledLeadingIconColor = MaterialTheme.colorScheme.primary,
                        disabledTrailingIconColor = MaterialTheme.colorScheme.primary,
                        disabledPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    shape = RoundedCornerShape(24.dp),
                    placeholder = { Text("Select exercise") },
                    leadingIcon = { Icon(Icons.Default.FitnessCenter, contentDescription = "Exercise icon") },
                    trailingIcon = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    try {
                                        exerciseSpeechLauncher.launch(exerciseSpeechIntent)
                                    } catch (e: Exception) {
                                    }
                                }
                            ) {
                                Icon(Icons.Default.Mic, contentDescription = "Speak Exercise Name")
                            }
                            IconButton(onClick = { dropdownExpanded = !dropdownExpanded }) {
                                Icon(
                                    imageVector = if (dropdownExpanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                                    contentDescription = "Toggle Dropdown"
                                )
                            }
                        }
                    }
                )
                
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .clickable { dropdownExpanded = true }
                )

                DropdownMenu(
                    expanded = dropdownExpanded,
                    onDismissRequest = { dropdownExpanded = false },
                    modifier = Modifier.fillMaxWidth(0.9f)
                ) {
                    exercises.forEach { exercise ->
                        DropdownMenuItem(
                            text = { Text(exercise, style = MaterialTheme.typography.bodyMedium) },
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                viewModel.setExerciseName(exercise)
                                dropdownExpanded = false
                            },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.FitnessCenter,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.secondary
                                )
                            }
                        )
                    }
                }
            }
            
            // Camera Preview Section
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            ) {
                if (hasCameraPermission) {
                    var previewView by remember { mutableStateOf<PreviewView?>(null) }
                    
                    LaunchedEffect(previewView, isFrontCamera) {
                        previewView?.let { pv ->
                            bindCameraUseCases(context, lifecycleOwner, pv, isFrontCamera, { bmp ->
                                viewModel.processFrame(bmp)
                            }, { landmarks, w, h ->
                                viewModel.updatePose(landmarks, w, h)
                            })
                        }
                    }

                    Box(modifier = Modifier.fillMaxSize()) {
                        AndroidView(
                            factory = { ctx ->
                                PreviewView(ctx).apply {
                                    scaleType = PreviewView.ScaleType.FILL_CENTER
                                    layoutParams = ViewGroup.LayoutParams(
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                        ViewGroup.LayoutParams.MATCH_PARENT
                                    )
                                    previewView = this
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )

                        if (isSetComplete) {
                            KonfettiView(
                                modifier = Modifier.fillMaxSize(),
                                parties = listOf(
                                    Party(
                                        speed = 0f,
                                        maxSpeed = 30f,
                                        damping = 0.9f,
                                        spread = 360,
                                        colors = listOf(0xfce18a, 0xff726d, 0xf4306d, 0xb98fb1),
                                        emitter = Emitter(duration = 100, TimeUnit.MILLISECONDS).max(100),
                                        position = Position.Relative(0.5, 0.3)
                                    )
                                )
                            )
                        }
                        
                        val frameWidth by viewModel.frameWidth.collectAsState()
                        val frameHeight by viewModel.frameHeight.collectAsState()

                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val landmarksMap = poseLandmarks.associateBy { it.type }
                            val bones = listOf(
                                Pair(11, 12),
                                Pair(11, 13), Pair(13, 15),
                                Pair(12, 14), Pair(14, 16),
                                Pair(11, 23), Pair(12, 24),
                                Pair(23, 24),
                                Pair(23, 25), Pair(25, 27),
                                Pair(24, 26), Pair(26, 28)
                            )
                            
                            val videoW = if (frameWidth > 0f) frameWidth else 480f
                            val videoH = if (frameHeight > 0f) frameHeight else 640f
                            
                            val scale = maxOf(size.width / videoW, size.height / videoH)
                            val scaledWidth = videoW * scale
                            val scaledHeight = videoH * scale
                            val offsetX = (size.width - scaledWidth) / 2f
                            val offsetY = (size.height - scaledHeight) / 2f
                            
                            fun mapXY(lm: NormalizedLandmark): Offset {
                                val vx = lm.x * scaledWidth + offsetX
                                val vy = lm.y * scaledHeight + offsetY
                                return Offset(vx, vy)
                            }
                            
                            bones.forEach { (startType, endType) ->
                                val start = landmarksMap[startType]
                                val end = landmarksMap[endType]
                                if (start != null && end != null) {
                                    drawLine(
                                        color = Color.White,
                                        start = mapXY(start),
                                        end = mapXY(end),
                                        strokeWidth = 6f
                                    )
                                }
                            }
                            
                            poseLandmarks.forEach { lm ->
                                drawCircle(
                                    color = Color.White,
                                    radius = 10f,
                                    center = mapXY(lm)
                                )
                            }
                        }
                        
                        Row(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(16.dp)
                                .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(16.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .background(
                                        color = if (isAnalyzing) Color.Green.copy(alpha = dotAlpha) else Color.Red,
                                        shape = CircleShape
                                    )
                                    .size(8.dp)
                            )
                            Text(
                                text = if (isAnalyzing) "COACHING LIVE" else "PAUSED",
                                color = Color.White,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        IconButton(
                            onClick = { viewModel.toggleCamera() },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(16.dp)
                                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        ) {
                            Icon(Icons.Default.FlipCameraAndroid, contentDescription = "Flip Camera", tint = Color.White)
                        }

                        Column(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .fillMaxWidth()
                                .background(Color.Black.copy(alpha = 0.7f))
                                .padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.FitnessCenter,
                                        contentDescription = "Exercise visual marker",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.padding(end = 8.dp)
                                    )
                                    Text(
                                        text = "AI Coach - $exerciseName",
                                        color = Color.White,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .clickable {
                                            try {
                                                assistantSpeechLauncher.launch(assistantSpeechIntent)
                                            } catch (e: Exception) {
                                            }
                                        }
                                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.25f), CircleShape)
                                        .padding(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Mic,
                                        contentDescription = "Speak to Assistant",
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(6.dp))
                            
                            Text(
                                text = "Feedback: \"$feedback\"",
                                color = Color.White.copy(alpha = 0.9f),
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Camera permission is required to analyze workspace posture.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }
                        ) {
                            Text("Request Camera Permission")
                        }
                    }
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 8.dp)
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Reps Progress",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "$repCount / 6 completed",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    for (i in 1..6) {
                        Box(
                            modifier = Modifier
                                .size(width = 8.dp, height = 32.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(
                                    if (i <= repCount) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                                )
                        )
                    }
                }
            }

            Button(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    focusManager.clearFocus() 
                    viewModel.toggleAnalysis() 
                },
                modifier = Modifier
                    .padding(bottom = 24.dp, top = 8.dp)
                    .height(56.dp)
                    .fillMaxWidth(0.8f),
                enabled = hasCameraPermission && exerciseName.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isAnalyzing) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
            ) {
                Icon(
                    imageVector = if (isAnalyzing) Icons.Default.Close else Icons.Default.PlayArrow,
                    contentDescription = if (isAnalyzing) "Stop Coaching" else "Start Coaching"
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isAnalyzing) "Stop Coaching" else "Start Coaching",
                    style = MaterialTheme.typography.titleMedium
                )
            }
        }
    }
}
