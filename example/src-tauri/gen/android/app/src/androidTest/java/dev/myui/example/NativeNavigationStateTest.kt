package dev.myui.example

import android.app.Activity
import android.graphics.Color
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.google.android.material.bottomnavigation.BottomNavigationView
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** 检查底栏实例、首帧几何和菜单更新，不把正常的水波纹与选中指示动画当作抖动。 */
@RunWith(AndroidJUnit4::class)
class NativeNavigationStateTest {
    @Test fun iconsAndLabelsKeepACompactGapAndTheSameHorizontalCenter() = withNavigation { fixture ->
        fixture.assertCompactAlignment()
        fixture.data.getJSONObject("bottom").put("modelValue", "home")
        fixture.frames { fixture.update() }
        fixture.assertCompactAlignment()
        fixture.data.getJSONObject("bottom").getJSONObject("style").put("labelSize", 13).put("fontWeight", 550)
        fixture.frames { fixture.update() }
        fixture.assertCompactAlignment()
    }

    @Test fun pageDataUpdatesPreserveBothDocksAndAllLabelPositions() = withNavigation { fixture ->
        val navigation = fixture.bar()
        val toolbar = fixture.toolbar()
        val before = fixture.geometry()
        repeat(8) { count ->
            fixture.data.getJSONObject("bottom").getJSONArray("items").getJSONObject(2)
                .getJSONObject("nativeProps").put("count", count + 1)
            val frames = fixture.frames { fixture.update() }
            assertSame("计数更新不能替换底栏", navigation, fixture.bar())
            assertSame("计数更新不能替换顶栏", toolbar, fixture.toolbar())
            assertTrue("计数更新不能移动图标或标签", frames.all { it == before })
        }
    }

    @Test fun aRequiredRecreationStartsAtItsFinalGeometryOnTheFirstFrame() = withNavigation { fixture ->
        val previous = fixture.bar()
        val frames = fixture.frames {
            val without = JSONObject(fixture.data.toString()).put("bottom", JSONObject.NULL)
            fixture.update(without)
            fixture.update()
        }
        assertNotSame(previous, fixture.bar())
        assertTrue("重建后的第一帧不能再改变图标、字号和文字基线：$frames", frames.all { it == frames.last() })
        fixture.assertTextStyle(11f, 700)
    }

    @Test fun switchingSelectionDoesNotMoveOrScaleIconsAndLabels() = withNavigation { fixture ->
        val navigation = fixture.bar()
        val before = fixture.geometry()
        for (value in listOf("home", "profile", "messages", "native")) {
            fixture.data.getJSONObject("bottom").put("modelValue", value)
            val frames = fixture.frames { fixture.update() }
            assertSame(navigation, fixture.bar())
            assertTrue("切换 $value 只能改变选中指示，不能移动或缩放内容：$frames", frames.all { it == before })
        }
    }

    @Test fun badgesThemeDisabledItemsAndStructureUpdateInPlace() = withNavigation { fixture ->
        val navigation = fixture.bar()
        val before = fixture.geometry()
        val bottom = fixture.data.getJSONObject("bottom")
        bottom.getJSONArray("items").getJSONObject(0).put("badge", "8")
        bottom.getJSONArray("items").getJSONObject(1).put("disabled", true)
        bottom.getJSONObject("style").put("primary", Color.RED).put("surface", Color.LTGRAY)
        val frames = fixture.frames { fixture.update() }
        assertSame(navigation, fixture.bar())
        assertTrue(frames.all { it == before })
        fixture.scenario.onActivity {
            assertEquals("8", navigation.getBadge(navigation.menu.getItem(0).itemId)!!.text)
            assertTrue(!navigation.menu.getItem(1).isEnabled)
        }
        bottom.getJSONObject("style").put("fontWeight", 550).put("labelSize", 13)
        fixture.frames { fixture.update() }
        fixture.assertTextStyle(13f, 550)
        bottom.getJSONArray("items").getJSONObject(0).remove("badge")
        val reversed = JSONArray()
        for (index in 3 downTo 0) reversed.put(bottom.getJSONArray("items").getJSONObject(index))
        bottom.put("items", reversed).put("modelValue", "messages")
        val reordered = fixture.frames { fixture.update() }
        assertSame(navigation, fixture.bar())
        assertTrue("重排菜单的首帧几何不稳定：$reordered", reordered.all { it == reordered.last() })
        fixture.assertTextStyle(13f, 550)
        fixture.scenario.onActivity {
            assertEquals("我的", navigation.menu.getItem(0).title.toString())
            assertTrue(navigation.menu.findItem(navigation.selectedItemId).title.toString() == "消息")
            assertEquals(null, navigation.getBadge(navigation.menu.getItem(3).itemId))
        }
    }

    @Test fun standaloneHideAndUpdatesPreserveTheSameBar() = withNavigation { fixture ->
        val bottom = JSONObject(fixture.data.getJSONObject("bottom").toString()).put("id", "overlay-bottom")
        bottom.getJSONObject("bounds").put("x", 0).put("y", 0).put("width", 400).put("viewport", 400)
        fixture.scenario.onActivity {
            fixture.hostType.getMethod("update", JSONObject::class.java).invoke(fixture.host, bottom)
        }
        val overlay = fixture.overlayBar()
        fixture.scenario.onActivity {
            fixture.hostType.getMethod("hide", String::class.java).invoke(fixture.host, "overlay-bottom")
            bottom.getJSONArray("items").getJSONObject(2).getJSONObject("nativeProps").put("count", 91)
            fixture.hostType.getMethod("update", JSONObject::class.java).invoke(fixture.host, bottom)
        }
        assertSame("暂隐和内容数据更新不能重建独立底栏", overlay, fixture.overlayBar())
    }

    private fun withNavigation(check: (Fixture) -> Unit) {
        ActivityScenario.launch(NativeProfileActivity::class.java).use { scenario ->
            val fixture = Fixture(scenario)
            scenario.onActivity { activity ->
                fixture.webView = WebView(activity)
                activity.setContentView(FrameLayout(activity).apply { addView(fixture.webView, FrameLayout.LayoutParams(-1, -1)) })
            }
            SystemClock.sleep(200)
            scenario.onActivity { activity ->
                fixture.host = fixture.hostType.getConstructor(Activity::class.java, WebView::class.java).newInstance(activity, fixture.webView)
                fixture.layout = fixture.layoutType.getConstructor(Activity::class.java, WebView::class.java, fixture.hostType)
                    .newInstance(activity, fixture.webView, fixture.host)
                fixture.update()
            }
            SystemClock.sleep(300)
            try { check(fixture) } finally {
                scenario.onActivity {
                    fixture.layoutType.getMethod("dispose").invoke(fixture.layout)
                    fixture.hostType.getMethod("dispose").invoke(fixture.host)
                    (fixture.webView.parent as? ViewGroup)?.removeView(fixture.webView)
                    fixture.webView.destroy()
                }
            }
        }
    }

    private data class Geometry(val label: String, val icon: List<Int>, val text: List<Int>, val size: Float, val scaleX: Float, val scaleY: Float)

    private class Fixture(val scenario: ActivityScenario<NativeProfileActivity>) {
        val hostType = Class.forName("com.luoyi.nativecomponents.NavigationHost")
        val layoutType = Class.forName("com.luoyi.nativecomponents.NativePageLayout")
        lateinit var webView: WebView
        lateinit var host: Any
        lateinit var layout: Any
        val data = configuration()

        fun update(value: JSONObject = data) { layoutType.getMethod("update", JSONObject::class.java).invoke(layout, value) }

        fun bar(): BottomNavigationView {
            var result: BottomNavigationView? = null
            scenario.onActivity { result = descendants(it.window.decorView).filterIsInstance<BottomNavigationView>().first() }
            return result!!
        }

        fun overlayBar(): BottomNavigationView {
            var result: BottomNavigationView? = null
            scenario.onActivity { result = descendants(it.window.decorView).filterIsInstance<BottomNavigationView>().last() }
            return result!!
        }

        fun toolbar(): View {
            var result: View? = null
            scenario.onActivity { result = descendants(it.window.decorView).first { view -> view is com.google.android.material.appbar.MaterialToolbar } }
            return result!!
        }

        fun geometry(): List<Geometry> {
            var result = emptyList<Geometry>()
            scenario.onActivity { result = geometryOnMain() }
            return result
        }

        private fun geometryOnMain(): List<Geometry> {
            val navigation = descendants(webView.rootView).filterIsInstance<BottomNavigationView>().first()
            val menu = navigation.getChildAt(0) as ViewGroup
            return (0 until menu.childCount).map { index ->
                val item = menu.getChildAt(index)
                val icon = item.findViewById<ImageView>(com.google.android.material.R.id.navigation_bar_item_icon_view)
                val text = descendants(item).filterIsInstance<TextView>().first { it.visibility == View.VISIBLE }
                Geometry(text.text.toString(), position(icon), position(text) + text.baseline, text.textSize, text.scaleX, text.scaleY)
            }
        }

        fun frames(change: () -> Unit): List<List<Geometry>> {
            val frames = mutableListOf<List<Geometry>>()
            val completed = CountDownLatch(1)
            scenario.onActivity { activity ->
                val root = activity.window.decorView
                val listener = object : ViewTreeObserver.OnPreDrawListener {
                    override fun onPreDraw(): Boolean {
                        frames.add(geometryOnMain())
                        if (frames.size == 16) { root.viewTreeObserver.removeOnPreDrawListener(this); completed.countDown() }
                        else root.postInvalidateOnAnimation()
                        return true
                    }
                }
                root.viewTreeObserver.addOnPreDrawListener(listener)
                change()
                root.postInvalidateOnAnimation()
            }
            assertTrue("未完成逐帧布局采样", completed.await(5, TimeUnit.SECONDS))
            return frames
        }

        fun assertTextStyle(size: Float, weight: Int) {
            scenario.onActivity {
                val labels = descendants(bar()).filterIsInstance<TextView>()
                assertEquals(8, labels.size)
                val scale = webView.width / 400f
                labels.forEach { text ->
                    assertEquals(size * scale, text.textSize, .01f)
                    assertEquals("'wght' $weight", text.fontVariationSettings)
                }
            }
        }

        fun assertCompactAlignment() {
            scenario.onActivity {
                val navigation = bar()
                val menu = navigation.getChildAt(0) as ViewGroup
                val scale = webView.width / 400f
                for (index in 0 until menu.childCount) {
                    val item = menu.getChildAt(index)
                    val icon = item.findViewById<ImageView>(com.google.android.material.R.id.navigation_bar_item_icon_view)
                    val container = item.findViewById<View>(com.google.android.material.R.id.navigation_bar_item_icon_container)
                    val labels = item.findViewById<View>(com.google.android.material.R.id.navigation_bar_item_labels_group)
                    val text = descendants(item).filterIsInstance<TextView>().first { view -> view.visibility == View.VISIBLE }
                    val iconBox = position(icon)
                    val textBox = position(text)
                    val labelBox = position(labels)
                    assertEquals("图标与文字必须共用水平中心", iconBox[0] + iconBox[2] / 2f, textBox[0] + textBox[2] / 2f, 1f)
                    assertEquals("图标与文字行盒的间距必须为 2 CSS 像素", 2 * scale, (labelBox[1] - iconBox[1] - iconBox[3]).toFloat(), 1f)
                    assertTrue("标签需要保留完整的单行行盒", text.height >= (16 * scale).toInt())
                    val indicator = item.findViewById<View>(com.google.android.material.R.id.navigation_bar_item_active_indicator_view)
                    assertTrue("选中动画和波纹必须有实际的圆角形状", indicator.background != null && container.foreground != null)
                }
            }
        }

        private fun position(view: View): List<Int> {
            val point = IntArray(2)
            view.getLocationInWindow(point)
            return listOf(point[0], point[1], view.width, view.height)
        }

        private fun descendants(view: View): List<View> = listOf(view) +
            if (view is ViewGroup) (0 until view.childCount).flatMap { descendants(view.getChildAt(it)) } else emptyList()

        private fun configuration(): JSONObject {
            val style = JSONObject().put("surface", Color.WHITE).put("text", Color.BLACK).put("secondary", Color.DKGRAY)
                .put("primary", Color.BLUE).put("selected", Color.LTGRAY).put("border", Color.GRAY)
                .put("fontWeight", 700).put("labelSize", 11).put("titleSize", 17).put("titleWeight", 600)
            val items = JSONArray()
            for ((value, label) in listOf("home" to "首页", "native" to "原生", "messages" to "消息", "profile" to "我的")) {
                items.put(JSONObject().put("value", value).put("label", label).put("nativeView", "demo")
                    .put("nativeProps", JSONObject().put("count", 0)).put("paths", JSONArray().put("M3 3h18v18H3z")))
            }
            return JSONObject().put("id", "layout").put("viewport", 400).put("safeArea", true)
                .put("top", JSONObject().put("id", "header").put("kind", "appBar").put("title", "导航回归")
                    .put("actions", JSONArray()).put("style", JSONObject(style.toString())).put("bounds", JSONObject().put("height", 56)))
                .put("bottom", JSONObject().put("id", "bottom").put("kind", "bottomNavigation").put("modelValue", "messages")
                    .put("items", items).put("style", style).put("bounds", JSONObject().put("height", 64)))
        }
    }
}
