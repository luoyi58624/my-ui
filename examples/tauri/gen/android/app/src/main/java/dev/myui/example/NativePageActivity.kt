package dev.myui.example

/** 独立页面只声明自己的 WebView 所有权，导航与窗口管理由插件负责。 */
class NativePageActivity : AppActivity() {
    override val releaseWebViewOnDestroy = true
}
