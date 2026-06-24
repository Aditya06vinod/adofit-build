package com.example.adoworkoutapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.example.adoworkoutapp.theme.AdoWorkoutAppTheme

fun Context.findActivity(): ComponentActivity? {
    var context = this
    while (context is ContextWrapper) {
        if (context is ComponentActivity) {
            return context
        }
        context = context.baseContext
    }
    return null
}

class AndroidInterface(private val activity: ComponentActivity) {
    @JavascriptInterface
    fun startPostureCoach(apiKey: String, exerciseName: String) {
        val intent = Intent(activity, PostureCoachActivity::class.java).apply {
            putExtra("GEMINI_API_KEY", apiKey)
            putExtra("EXERCISE_NAME", exerciseName)
        }
        activity.startActivity(intent)
    }
}

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val currentUrl = webView?.url ?: ""
                
                when {
                    // If in Diet Tracker (Diary), go to Quick Log instead of jumping to Home
                    currentUrl.contains("#/diet") && !currentUrl.contains("diet-insight") -> {
                        webView?.evaluateJavascript("window.location.hash = '#/log'", null)
                    }
                    // If in Active Workout, go back to Workouts Explore page
                    currentUrl.contains("#/workout-active") -> {
                        webView?.evaluateJavascript("window.location.hash = '#/workouts'", null)
                    }
                    // Standard back navigation for other pages
                    webView?.canGoBack() == true -> {
                        webView?.goBack()
                    }
                    else -> {
                        // Minimize the app to the Home screen instead of exiting
                        moveTaskToBack(true)
                    }
                }
            }
        })

        setContent {
            AdoWorkoutAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WebViewScreen(
                        onWebViewCreated = { webView = it }
                    )
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewScreen(onWebViewCreated: (WebView) -> Unit, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            val activity = context.findActivity()
            val assetLoader = WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(context))
                .build()

            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.databaseEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false

                if (activity != null) {
                    addJavascriptInterface(AndroidInterface(activity), "AndroidInterface")
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest
                    ): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }

                    @Deprecated("Deprecated in Java")
                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                        return false
                    }
                }
                onWebViewCreated(this)
                
                try {
                    val htmlContent = context.assets.open("index.html").bufferedReader().use { it.readText() }
                    loadDataWithBaseURL("https://appassets.androidplatform.net/", htmlContent, "text/html", "UTF-8", null)
                } catch (e: Exception) {
                    loadUrl("file:///android_asset/index.html")
                }
            }
        },
        modifier = modifier.fillMaxSize()
    )
}
