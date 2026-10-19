package dev.myui.example

import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.annotation.Keep

/** 两个 Activity 共用弹层返回桥接，各自只操作自己的 WebView。 */
abstract class OverlayActivity : TauriActivity() {
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

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        overlayWebView = webView
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
