package dev.myui.example

import android.os.Bundle
import android.webkit.WebView
import com.luoyi.nativecomponents.NativeWindow

/** 宿主生成的 TauriActivity 只在本应用可见，此处仅向插件转发生命周期。 */
abstract class AppActivity : TauriActivity() {
    protected open val releaseWebViewOnDestroy = false
    private val nativeWindow by lazy { NativeWindow(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        NativeWindow.prepare(this)
        super.onCreate(savedInstanceState)
        nativeWindow.onCreate(waitForPage = releaseWebViewOnDestroy)
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        nativeWindow.onWebViewCreate(webView)
    }

    override fun onStart() { super.onStart(); nativeWindow.onStart() }
    override fun onResume() { super.onResume(); nativeWindow.onResume() }
    override fun onStop() { nativeWindow.onStop(); super.onStop() }
    override fun onDestroy() { super.onDestroy(); nativeWindow.onDestroy(releaseWebViewOnDestroy) }
}
