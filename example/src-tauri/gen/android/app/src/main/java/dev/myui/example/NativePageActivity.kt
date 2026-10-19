package dev.myui.example

import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

/** 承载独立的示例页面，保留系统 Activity 返回栈与预测性返回动画。 */
class NativePageActivity : OverlayActivity() {
    private var pageWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        // 没有弹层时仍由系统返回上一个 Activity。
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        pageWebView = webView
    }

    override fun onDestroy() {
        super.onDestroy()
        // Tauri 清理原生句柄后显式释放 WebView，避免返回后仍保留页面和脚本。
        pageWebView?.let { webView ->
            (webView.parent as? ViewGroup)?.removeView(webView)
            webView.destroy()
        }
        pageWebView = null
    }
}
