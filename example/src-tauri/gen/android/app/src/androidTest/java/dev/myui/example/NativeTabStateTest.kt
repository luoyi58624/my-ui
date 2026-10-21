package dev.myui.example

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.luoyi.nativecomponents.NativeTabContent
import com.luoyi.nativecomponents.NativeTabViews
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

/** 在真实原生控件上检查 Tab 保活、按输入更新和字体稳定性。 */
@RunWith(AndroidJUnit4::class)
class NativeTabStateTest {
    @Test fun switchingOnlyChangesVisibilityAndRetainsPageState() = withActivity { activity ->
        val pages = mutableListOf<RecordingPage>()
        val factory = "tab-state-${UUID.randomUUID()}"
        NativeTabViews.register(factory) { owner, _ -> RecordingPage(owner).also(pages::add) }
        val container = Container(activity)
        try {
            container.update(data("first", factory), appearance())
            val first = pages.single()
            first.editor.setText("未提交的草稿")
            first.editor.setSelection(3)
            first.view.measure(exact(800), exact(1000))
            first.view.layout(0, 0, 800, 1000)
            first.view.scrollTo(0, 180)
            assertEquals(180, first.view.scrollY)

            container.update(data("second", factory), appearance())
            val second = pages.last()
            repeat(12) {
                container.update(data("first", factory), appearance())
                container.update(data("second", factory), appearance())
            }
            container.update(data("first", factory), appearance())

            assertEquals(2, pages.size)
            assertSame(first.view, container.view.getChildAt(0))
            assertSame(second.view, container.view.getChildAt(1))
            assertEquals(1, first.updates)
            assertEquals(1, second.updates)
            assertEquals("未提交的草稿", first.editor.text.toString())
            assertEquals(3, first.editor.selectionStart)
            assertEquals(180, first.view.scrollY)
            assertEquals(View.VISIBLE, first.view.visibility)
            assertEquals(View.GONE, second.view.visibility)
        } finally { container.dispose() }
        assertTrue(pages.all { it.disposals == 1 })
    }

    @Test fun updatesOnlyReachPagesWhoseInputsChanged() = withActivity { activity ->
        val pages = mutableListOf<RecordingPage>()
        val factory = "tab-input-${UUID.randomUUID()}"
        NativeTabViews.register(factory) { owner, _ -> RecordingPage(owner).also(pages::add) }
        val container = Container(activity)
        try {
            container.update(data("first", factory), appearance())
            container.update(data("second", factory), appearance())
            val changed = data("first", factory).apply {
                getJSONArray("items").getJSONObject(1).getJSONObject("nativeProps").put("count", 9)
            }
            container.update(changed, appearance())
            assertEquals(listOf(1, 2), pages.map { it.updates })
            assertEquals(9, pages[1].lastCount)

            val themed = appearance().put("surface", Color.LTGRAY)
            container.update(changed, themed)
            assertEquals(listOf(2, 3), pages.map { it.updates })
            container.update(changed, themed, 2f)
            assertEquals(listOf(3, 4), pages.map { it.updates })
            container.update(changed, themed, 2f)
            assertEquals(listOf(3, 4), pages.map { it.updates })

            changed.getJSONArray("items").remove(1)
            container.update(changed, themed, 2f)
            assertEquals(1, pages[1].disposals)
            assertEquals(0, pages[0].disposals)
            assertEquals(3, pages[0].updates)
        } finally { container.dispose() }
        assertTrue(pages.all { it.disposals == 1 })
    }

    @Test fun themeAndDataUpdatesPreserveNativeTextWeights() = withActivity { activity ->
        DemoNativeTabs.register()
        val container = Container(activity)
        val profile = data("first", "profile", "demo")
        val messages = data("second", "profile", "demo")
        val original = appearance()
        try {
            container.update(profile, original)
            container.update(messages, original)
            val text = textViews(container.view)
            assertTrue(text.size >= 13)
            val fonts = text.map { it.paint.typeface }
            val raster = text.map(::raster)

            val themed = appearance().put("surface", Color.LTGRAY).put("primary", Color.RED)
            container.update(messages, themed)
            text.forEachIndexed { index, view ->
                assertSame("主题更新不能覆盖 ${view.text} 的字体", fonts[index], view.paint.typeface)
                assertEquals("主题更新不能改变 ${view.text} 的字重", raster[index], raster(view))
            }

            messages.getJSONArray("items").getJSONObject(1).getJSONObject("nativeProps").put("count", 7)
            container.update(messages, themed)
            text.forEachIndexed { index, view -> assertSame(fonts[index], view.paint.typeface) }
            assertTrue(text.any { it.text.toString() == "点一下 · 7" })

            container.update(profile, appearance().put("fontWeight", 450).put("titleWeight", 550))
            assertTrue(text.all { it.fontVariationSettings in listOf("'wght' 450", "'wght' 550") })
            container.update(profile, original)
            text.forEachIndexed { index, view -> assertEquals(raster[index], raster(view)) }
        } finally { container.dispose() }
    }

    private fun withActivity(check: (NativeProfileActivity) -> Unit) {
        ActivityScenario.launch(NativeProfileActivity::class.java).use { scenario -> scenario.onActivity(check) }
    }

    private fun exact(size: Int) = View.MeasureSpec.makeMeasureSpec(size, View.MeasureSpec.EXACTLY)

    private fun appearance() = JSONObject().put("surface", Color.WHITE).put("text", Color.BLACK)
        .put("secondary", Color.DKGRAY).put("primary", Color.BLUE).put("selected", Color.LTGRAY)
        .put("border", Color.GRAY).put("fontWeight", 700).put("titleWeight", 800)

    private fun data(selected: String, first: String, second: String = first) = JSONObject()
        .put("modelValue", selected).put("items", JSONArray().apply {
            for ((value, factory) in listOf("first" to first, "second" to second)) {
                put(JSONObject().put("value", value).put("label", value).put("nativeView", factory)
                    .put("paths", JSONArray().put("M3 3h18v18H3z"))
                    .put("nativeProps", JSONObject().put("count", 0).put("demo", 2)))
            }
        })

    private fun textViews(view: View): List<TextView> = when (view) {
        is TextView -> listOf(view)
        is ViewGroup -> (0 until view.childCount).flatMap { textViews(view.getChildAt(it)) }
        else -> emptyList()
    }

    private fun raster(view: TextView): Int {
        val bitmap = Bitmap.createBitmap(1200, 120, Bitmap.Config.ARGB_8888)
        val paint = Paint(view.paint).apply { textSize = 64f; color = Color.BLACK }
        Canvas(bitmap).drawText("字体字重 Aa09", 0f, 90f, paint)
        val pixels = IntArray(bitmap.width * bitmap.height)
        bitmap.getPixels(pixels, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
        bitmap.recycle()
        assertFalse("文字绘制不能为空", pixels.all { it == 0 })
        return pixels.contentHashCode()
    }

    private class RecordingPage(activity: Activity) : NativeTabContent {
        override val view = ScrollView(activity)
        val editor = EditText(activity)
        var updates = 0
        var disposals = 0
        var lastCount = 0
        init {
            view.addView(LinearLayout(activity).apply {
                orientation = LinearLayout.VERTICAL
                addView(editor)
                addView(View(activity), LinearLayout.LayoutParams(1, 4000))
            })
        }
        override fun update(props: JSONObject, appearance: JSONObject, scale: Float) {
            updates++
            lastCount = props.getInt("count")
        }
        override fun dispose() { disposals++ }
    }

    // 通过反射验证插件内部容器，避免仅为宿主回归检查扩大插件公开 API。
    private class Container(activity: Activity) {
        private val type = Class.forName("com.luoyi.nativecomponents.NativeTabContainer")
        val view = type.getDeclaredConstructor(Activity::class.java, Function2::class.java)
            .newInstance(activity, { _: String, _: String -> }) as FrameLayout
        fun update(data: JSONObject, style: JSONObject, scale: Float = 1f) {
            type.getDeclaredMethod("update", JSONObject::class.java, JSONObject::class.java, Float::class.javaPrimitiveType)
                .invoke(view, data, style, scale)
        }
        fun dispose() { type.getDeclaredMethod("dispose").invoke(view) }
    }
}
