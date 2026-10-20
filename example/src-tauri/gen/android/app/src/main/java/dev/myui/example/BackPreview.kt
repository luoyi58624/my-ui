package dev.myui.example

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.PixelCopy
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.WebView
import android.widget.ImageView

/** 为系统返回预览保留窗口画面，WebView 恢复绘制后交回实时内容。 */
internal class BackPreview(private val activity: Activity) {
    private val handler = Handler(Looper.getMainLooper())
    private var image: ImageView? = null
    private var generation = 0L
    private var resumed = false

    /** 在窗口仍有已提交画面时复制，避免后台 WebView 的绘制资源被释放后预览空白。 */
    fun capture() {
        resumed = false
        val request = ++generation
        val root = activity.findViewById<ViewGroup>(android.R.id.content) ?: return
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || activity.isFinishing || activity.isDestroyed || !root.isAttachedToWindow ||
            root.width <= 0 || root.height <= 0 ||
            activity.window.attributes.flags and WindowManager.LayoutParams.FLAG_SECURE != 0) return
        val location = IntArray(2)
        root.getLocationInWindow(location)
        val bounds = Rect(location[0], location[1], location[0] + root.width, location[1] + root.height)
        // 预览只是视觉兜底，低内存时不应为它中断实际页面跳转。
        val bitmap = try { Bitmap.createBitmap(root.width, root.height, Bitmap.Config.ARGB_8888) }
            catch (_: OutOfMemoryError) { return }
        try { PixelCopy.request(activity.window, bounds, bitmap, { result ->
            if (result != PixelCopy.SUCCESS || resumed || generation != request || activity.isDestroyed) return@request
            clear()
            image = ImageView(activity).apply {
                scaleType = ImageView.ScaleType.FIT_XY
                importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
                setImageBitmap(bitmap)
                // 只覆盖显示，不拦截恢复过程中已经到达 WebView 的输入。
                isClickable = false
            }.also { root.addView(it, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)) }
        }, handler) } catch (_: IllegalArgumentException) {
            // 首帧尚未提交或窗口正被移除时可能没有有效 Surface，直接沿用实时页面。
        }
    }

    /** 等待下一次 WebView 绘制可包含当前文档状态，再移除预览。 */
    fun resume(webView: WebView?) {
        resumed = true
        val request = ++generation
        if (image == null) return
        if (webView == null) { clear(); return }
        webView.postVisualStateCallback(request, object : WebView.VisualStateCallback() {
            override fun onComplete(requestId: Long) {
                if (resumed && generation == requestId && !activity.isDestroyed) clear()
            }
        })
    }

    /** 失效所有异步回调并释放此窗口持有的画面。 */
    fun destroy() {
        ++generation
        resumed = false
        clear()
    }

    private fun clear() {
        image?.let { preview ->
            (preview.parent as? ViewGroup)?.removeView(preview)
            preview.setImageDrawable(null)
        }
        image = null
    }
}
