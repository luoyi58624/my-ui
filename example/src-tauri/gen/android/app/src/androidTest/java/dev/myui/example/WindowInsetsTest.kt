package dev.myui.example

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.os.SystemClock
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/** 安全区和 IME 只消耗一次，不能为避让重挂 WebView 或累积 padding。 */
@RunWith(AndroidJUnit4::class)
class WindowInsetsTest {
    @Test fun keyboardAndSafeAreaShareOnePaddingWithoutReparenting() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            var loadedWebView: WebView? = null
            val deadline = SystemClock.uptimeMillis() + 10_000
            do {
                InstrumentationRegistry.getInstrumentation().waitForIdleSync()
                scenario.onActivity { loadedWebView = findWebView(it.findViewById(android.R.id.content)) }
                if (loadedWebView != null) break
                SystemClock.sleep(50)
            } while (SystemClock.uptimeMillis() < deadline)
            assertNotNull("必须等实际 WebView 挂载，不能跳过父布局验证", loadedWebView)
            scenario.onActivity { activity ->
                val content = activity.findViewById<ViewGroup>(android.R.id.content)
                val webView = loadedWebView!!
                val originalParent = webView.parent
                fun apply(bottom: Int) {
                    val insets = WindowInsetsCompat.Builder()
                        .setInsets(WindowInsetsCompat.Type.systemBars(), Insets.of(4, 24, 6, 20))
                        .setInsets(WindowInsetsCompat.Type.ime(), Insets.of(0, 0, 0, bottom))
                        .build()
                    val remaining = ViewCompat.dispatchApplyWindowInsets(content, insets)
                    assertTrue("子 WebView 不应重复收到宿主已消费的 insets", remaining.isConsumed)
                    assertEquals(4, content.paddingLeft)
                    assertEquals(24, content.paddingTop)
                    assertEquals(6, content.paddingRight)
                    assertEquals(maxOf(20, bottom), content.paddingBottom)
                    assertSame("窗口避让不能重新挂载 WebView", originalParent, webView.parent)
                }
                apply(0)
                apply(280)
                apply(280)
                apply(0)
            }
        }
    }

    private fun findWebView(view: View): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) for (index in 0 until view.childCount) findWebView(view.getChildAt(index))?.let { return it }
        return null
    }
}
