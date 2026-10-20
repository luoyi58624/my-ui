package dev.myui.example

import android.app.UiModeManager
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.annotation.Keep
import androidx.core.view.WindowCompat
import androidx.appcompat.app.AppCompatDelegate

/** 两个 Activity 共用弹层返回桥接，各自只操作自己的 WebView。 */
abstract class OverlayActivity : TauriActivity() {
    private companion object {
        // 主题属于应用；新建或恢复 Activity 时立即沿用，避免等 WebView 回调才改变图标颜色。
        var appDarkMode: Boolean? = null
        var appBackgroundColor: Int = 0xfff2f3f5.toInt()
        var appNightMode: Int? = null
    }
    private var overlayWebView: WebView? = null
    private val overlayBack = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            val webView = overlayWebView
            if (webView == null) {
                resumeSystemBack()
                return
            }
            // 手势提交时才关闭；取消返回手势时不改变任何弹层状态。
            webView.evaluateJavascript("Boolean(globalThis.MyUI?.layers?.dismissTop())") { handled ->
                if (handled != "true" && !isFinishing && !isDestroyed) resumeSystemBack()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appDarkMode?.let(::applySystemBars)
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        overlayWebView = webView
        appDarkMode?.let(::applySystemBars)
    }

    override fun onStart() {
        super.onStart()
        // 预测性返回在上页 Resume 前就展示它；可见时恢复 WebView，才能绘制实时画面。
        overlayWebView?.onResume()
    }

    override fun onResume() {
        super.onResume()
        appDarkMode?.let(::applySystemBars)
    }

    override fun onStop() {
        // 取消侧滑可能直接 Start -> Stop，没有 Pause 回调，仍须暂停已不可见的 WebView。
        overlayWebView?.onPause()
        super.onStop()
    }

    /** 同步应用夜间模式、窗口背景以及系统栏的文字和图标。 */
    @Keep
    fun setAppDarkMode(dark: Boolean, backgroundColor: Int, followSystem: Boolean) {
        runOnUiThread {
            if (isFinishing || isDestroyed) return@runOnUiThread
            appDarkMode = dark
            appBackgroundColor = backgroundColor
            // 跟随系统时撤销应用覆盖，保持系统配置与网页媒体查询一致。
            val mode = if (followSystem) UiModeManager.MODE_NIGHT_AUTO
                else if (dark) UiModeManager.MODE_NIGHT_YES else UiModeManager.MODE_NIGHT_NO
            if (appNightMode != mode) {
                appNightMode = mode
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    getSystemService(UiModeManager::class.java)?.setApplicationNightMode(mode)
                } else {
                    AppCompatDelegate.setDefaultNightMode(if (followSystem) AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM else mode)
                }
            }
            applySystemBars(dark)
        }
    }

    private fun applySystemBars(dark: Boolean) {
        // Activity 和未提交网页首帧的 WebView 也必须使用同一个背景。
        window.setBackgroundDrawable(ColorDrawable(appBackgroundColor))
        overlayWebView?.setBackgroundColor(appBackgroundColor)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = !dark
            isAppearanceLightNavigationBars = !dark
        }
    }

    /** 由当前窗口的 Rust 命令调用，保留 JNI 方法名供 release 混淆后查找。 */
    @Keep
    fun setOverlayBackEnabled(enabled: Boolean) {
        runOnUiThread {
            if (isFinishing || isDestroyed) return@runOnUiThread
            if (enabled) {
                // 在 Tauri 默认返回之后注册，有弹层时取得优先权。
                overlayBack.remove()
                onBackPressedDispatcher.addCallback(this, overlayBack)
            }
            overlayBack.isEnabled = enabled
        }
    }

    private fun resumeSystemBack() {
        overlayBack.isEnabled = false
        onBackPressedDispatcher.onBackPressed()
    }

    override fun onDestroy() {
        overlayBack.remove()
        overlayWebView = null
        super.onDestroy()
    }
}
