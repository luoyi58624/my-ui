package dev.myui.example

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Rect
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.MotionEvent
import android.view.PixelCopy
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.lifecycle.Lifecycle
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** 读取真实窗口像素，验证按压范围、取消恢复和更新期间的波纹连续性。 */
@RunWith(AndroidJUnit4::class)
class NativeProfileRippleTest {
    @Test fun pressingEitherRowDoesNotPaintItsNeighbourAndCancelRestoresTheCard() = withProfile { fixture ->
        for (title in listOf("个人资料", "浏览组件")) {
            val before = fixture.capture()
            val row = fixture.row(title)
            val card = fixture.bounds(row.parent as View)
            val target = fixture.bounds(row)
            fixture.touch(row, MotionEvent.ACTION_DOWN)
            SystemClock.sleep(450)
            val pressed = fixture.capture()
            var inside = 0
            var outside = 0
            for (y in card.top until card.bottom) for (x in card.left until card.right) {
                if (!samePixel(before, pressed, x, y, card)) {
                    if (target.contains(x, y)) inside++ else outside++
                }
            }
            assertTrue("$title 必须有可见的按压反馈", inside > 100)
            assertEquals("$title 的波纹不能涂到相邻行", 0, outside)
            fixture.touch(row, MotionEvent.ACTION_CANCEL)
            SystemClock.sleep(600)
            val cancelled = fixture.capture()
            assertRegionEquals(before, cancelled, card)
            fixture.scenario.onActivity { assertTrue(fixture.actions.isEmpty()) }
            assertEquals(Lifecycle.State.RESUMED, fixture.scenario.state)
            before.recycle(); pressed.recycle(); cancelled.recycle()
        }
    }

    @Test fun appearanceUpdatesKeepTheActiveRippleAndACompletedTapFiresOnce() = withProfile { fixture ->
        val row = fixture.row("浏览组件")
        val ripple = row.background
        fixture.touch(row, MotionEvent.ACTION_DOWN)
        SystemClock.sleep(200)
        fixture.scenario.onActivity {
            assertTrue(row.isPressed)
            fixture.tab.update(JSONObject(), appearance().put("primary", Color.RED), 2f)
            assertSame("改变颜色不能重建正在按压的波纹", ripple, row.background)
            assertTrue(row.isPressed)
        }
        fixture.touch(row, MotionEvent.ACTION_UP)
        SystemClock.sleep(600)
        fixture.scenario.onActivity {
            assertEquals(listOf("home"), fixture.actions)
            assertTrue(!row.isPressed)
        }
    }

    private fun withProfile(check: (Fixture) -> Unit) {
        ActivityScenario.launch(NativeProfileActivity::class.java).use { scenario ->
            val fixture = Fixture(scenario)
            scenario.onActivity { activity ->
                fixture.tab = NativeProfileTab(activity) { fixture.actions.add(it) }
                fixture.tab.update(JSONObject(), appearance(), 2f)
                activity.setContentView(FrameLayout(activity).apply {
                    setBackgroundColor(Color.WHITE)
                    setPadding(80, 180, 80, 160)
                    isFocusableInTouchMode = true
                    addView(fixture.tab.view, FrameLayout.LayoutParams(-1, -1))
                    requestFocus()
                })
            }
            SystemClock.sleep(300)
            try { check(fixture) } finally {
                scenario.onActivity {
                    val cancel = MotionEvent.obtain(0, SystemClock.uptimeMillis(), MotionEvent.ACTION_CANCEL, 0f, 0f, 0)
                    try { fixture.tab.view.dispatchTouchEvent(cancel) } finally { cancel.recycle() }
                    fixture.tab.dispose()
                }
            }
        }
    }

    private fun appearance() = JSONObject().put("surface", Color.WHITE).put("text", Color.BLACK)
        .put("secondary", Color.DKGRAY).put("primary", Color.BLUE).put("selected", Color.LTGRAY)
        .put("fontWeight", 400).put("titleWeight", 600)

    private fun assertRegionEquals(before: Bitmap, after: Bitmap, bounds: Rect) {
        var changed = 0
        for (y in bounds.top until bounds.bottom) for (x in bounds.left until bounds.right) {
            if (!samePixel(before, after, x, y, bounds)) changed++
        }
        assertEquals("取消按压后卡片不能残留波纹或触发点击", 0, changed)
    }

    private fun samePixel(before: Bitmap, after: Bitmap, x: Int, y: Int, bounds: Rect): Boolean {
        val first = before.getPixel(x, y)
        val last = after.getPixel(x, y)
        if (first == last) return true
        // 夹具使用 2 倍比例、40px 圆角；GPU 重绘时只豁免角落 1～3 阶的中性抗锯齿差异。
        val corner = (x < bounds.left + 40 || x >= bounds.right - 40) &&
            (y < bounds.top + 40 || y >= bounds.bottom - 40)
        val red = Color.red(first) - Color.red(last)
        val green = Color.green(first) - Color.green(last)
        val blue = Color.blue(first) - Color.blue(last)
        return corner && red == green && green == blue && kotlin.math.abs(red) <= 3
    }

    private class Fixture(val scenario: ActivityScenario<NativeProfileActivity>) {
        lateinit var tab: NativeProfileTab
        val actions = mutableListOf<String>()
        private var downTime = 0L

        fun row(title: String): View {
            fun find(view: View): TextView? {
                if (view is TextView && view.text.toString() == title) return view
                if (view is ViewGroup) for (index in 0 until view.childCount) {
                    find(view.getChildAt(index))?.let { return it }
                }
                return null
            }
            var result: View? = null
            scenario.onActivity { result = find(tab.view)!!.parent.parent as View }
            return result!!
        }

        fun bounds(view: View): Rect {
            val rect = Rect()
            scenario.onActivity {
                val location = IntArray(2)
                view.getLocationInWindow(location)
                rect.set(location[0], location[1], location[0] + view.width, location[1] + view.height)
            }
            return rect
        }

        fun touch(row: View, action: Int) {
            val rect = bounds(row)
            scenario.onActivity { activity ->
                val now = SystemClock.uptimeMillis()
                if (action == MotionEvent.ACTION_DOWN) downTime = now
                val event = MotionEvent.obtain(downTime, now, action, rect.exactCenterX(), rect.exactCenterY(), 0)
                try { activity.dispatchTouchEvent(event) } finally { event.recycle() }
            }
        }

        fun capture(): Bitmap {
            var bitmap: Bitmap? = null
            var result = PixelCopy.ERROR_UNKNOWN
            val copied = CountDownLatch(1)
            scenario.onActivity { activity ->
                val decor = activity.window.decorView
                bitmap = Bitmap.createBitmap(decor.width, decor.height, Bitmap.Config.ARGB_8888)
                PixelCopy.request(activity.window, bitmap!!, { result = it; copied.countDown() }, Handler(Looper.getMainLooper()))
            }
            assertTrue("窗口像素读取超时", copied.await(5, TimeUnit.SECONDS))
            assertEquals(PixelCopy.SUCCESS, result)
            return bitmap!!
        }

    }
}
