package com.example.adoworkoutapp.camera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.defaults.PoseDetectorOptions

data class NormalizedLandmark(val type: Int, val x: Float, val y: Float)

fun bindCameraUseCases(
    context: Context,
    lifecycleOwner: LifecycleOwner,
    previewView: PreviewView,
    isFrontCamera: Boolean,
    onFrame: (Bitmap) -> Unit,
    onPoseDetected: (List<NormalizedLandmark>, Float, Float) -> Unit
) {
    val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

    val options = PoseDetectorOptions.Builder()
        .setDetectorMode(PoseDetectorOptions.STREAM_MODE)
        .build()
    val poseDetector = PoseDetection.getClient(options)

    cameraProviderFuture.addListener({
        try {
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .build()
                .also {
                    it.surfaceProvider = previewView.surfaceProvider
                }

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(ContextCompat.getMainExecutor(context)) { imageProxy ->
                        @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
                        val mediaImage = imageProxy.image
                        if (mediaImage != null) {
                            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                            poseDetector.process(image)
                                .addOnSuccessListener { pose ->
                                    val rotation = imageProxy.imageInfo.rotationDegrees
                                    val w = imageProxy.width.toFloat()
                                    val h = imageProxy.height.toFloat()
                                    
                                    val rotatedW = if (rotation == 90 || rotation == 270) h else w
                                    val rotatedH = if (rotation == 90 || rotation == 270) w else h

                                    val landmarks = pose.allPoseLandmarks.map { landmark ->
                                        var normX = landmark.position.x / rotatedW
                                        val normY = landmark.position.y / rotatedH
                                        
                                        if (isFrontCamera) {
                                            normX = 1.0f - normX
                                        }
                                        
                                        NormalizedLandmark(landmark.landmarkType, normX, normY)
                                    }
                                    onPoseDetected(landmarks, rotatedW, rotatedH)
                                }
                                .addOnCompleteListener {
                                    processBitmap(imageProxy, isFrontCamera, onFrame)
                                    imageProxy.close()
                                }
                        } else {
                            imageProxy.close()
                        }
                    }
                }

            val cameraSelector = if (isFrontCamera) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )
            } catch (exc: Exception) {
                Log.e("CameraHelper", "Use case binding failed", exc)
            }
        } catch (exc: Exception) {
            Log.e("CameraHelper", "Initialization of camera provider failed", exc)
        }
    }, ContextCompat.getMainExecutor(context))
}

private fun processBitmap(imageProxy: ImageProxy, isFrontCamera: Boolean, onFrame: (Bitmap) -> Unit) {
    val bitmap = imageProxy.toBitmap()
    
    if (isFrontCamera) {
        val matrix = Matrix()
        matrix.postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f)
        val mirroredBitmap = Bitmap.createBitmap(
            bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
        )
        onFrame(mirroredBitmap)
    } else {
        onFrame(bitmap)
    }
}
