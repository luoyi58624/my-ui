package dev.myui.example

import android.graphics.Color
import android.graphics.drawable.RippleDrawable
import android.graphics.drawable.GradientDrawable
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.appcompat.widget.SwitchCompat
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/** 在实际 Android 控件上检查设置页吸顶、保活和按压取消。 */
@RunWith(AndroidJUnit4::class)
class NativeSettingsUiTest {
    @Test fun searchPinsWithoutAddingASecondTitle() = fixture { tab ->
        val scroller = tab.view.findViewWithTag<ScrollView>("settings-scroll")
        val search = tab.view.findViewWithTag<View>("settings-search")
        val title = tab.view.findViewWithTag<TextView>("settings-large-title")
        assertTrue(search.translationY > 0)
        scroller.scrollTo(0, title.height + 60)
        assertEquals(0f, search.translationY, .01f)
        assertEquals(1, descendants(tab.view).filterIsInstance<TextView>().count { it.text.toString() == "设置" })
        scroller.scrollTo(0, 0)
        assertEquals(title.height.toFloat(), search.translationY, .01f)
    }

    @Test fun appearanceAndVisibilityUpdatesRetainScrollToggleAndTextInstances() = fixture { tab ->
        val scroller = tab.view.findViewWithTag<ScrollView>("settings-scroll")
        val toggle = tab.view.findViewWithTag<SwitchCompat>("settings-toggle-airplane")
        val title = tab.view.findViewWithTag<TextView>("settings-large-title")
        toggle.isChecked = true
        scroller.scrollTo(0, 170)
        val position = scroller.scrollY
        val font = title.typeface
        repeat(12) { tab.view.visibility = View.GONE; tab.view.visibility = View.VISIBLE }
        tab.update(props(), appearance().put("primary", Color.RED), scale())
        assertSame(scroller, tab.view.findViewWithTag("settings-scroll"))
        assertSame(toggle, tab.view.findViewWithTag("settings-toggle-airplane"))
        assertSame(font, title.typeface)
        assertEquals(position, scroller.scrollY)
        assertTrue(toggle.isChecked)
        val search = tab.view.findViewWithTag<View>("settings-search-field")
        val light = (search.background as GradientDrawable).color!!.defaultColor
        tab.update(props(), appearance().put("surface", Color.BLACK).put("text", Color.WHITE), scale())
        assertSame(search, tab.view.findViewWithTag("settings-search-field"))
        assertTrue((search.background as GradientDrawable).color!!.defaultColor != light)
        assertEquals(position, scroller.scrollY)
        assertTrue(toggle.isChecked)
    }

    @Test fun draggingCancelsRowPressWithoutOpeningAPage() = fixture { tab ->
        val row = tab.view.findViewWithTag<View>("settings-row-wifi")
        assertTrue(row.foreground is RippleDrawable)
        val down = MotionEvent.obtain(0, 0, MotionEvent.ACTION_DOWN, row.width / 2f, row.height / 2f, 0)
        val cancel = MotionEvent.obtain(0, 10, MotionEvent.ACTION_CANCEL, row.width / 2f, row.height / 2f, 0)
        row.dispatchTouchEvent(down)
        row.dispatchTouchEvent(cancel)
        assertFalse(row.isPressed)
        down.recycle(); cancel.recycle()
    }

    private fun fixture(check: (NativeSettingsTab) -> Unit) {
        ActivityScenario.launch(NativeSettingsActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                val tab = NativeSettingsTab(activity)
                tab.update(props(), appearance(), scale())
                activity.setContentView(tab.view)
                tab.view.measure(View.MeasureSpec.makeMeasureSpec(900, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(1400, View.MeasureSpec.EXACTLY))
                tab.view.layout(0, 0, 900, 1400)
                check(tab)
            }
        }
    }
    private fun scale() = 2f
    private fun appearance() = JSONObject().put("surface", Color.WHITE).put("text", Color.BLACK)
        .put("secondary", Color.GRAY).put("primary", Color.BLUE).put("fontWeight", 500).put("titleWeight", 600)
    private fun props() = JSONObject().put("account", JSONObject().put("title", "小蓝同学"))
        .put("groups", JSONArray().put(JSONArray().apply {
            for (index in 0 until 20) put(JSONObject().put("id", if (index == 0) "airplane" else if (index == 1) "wifi" else "row-$index")
                .put("title", if (index == 0) "飞行模式" else if (index == 1) "WLAN" else "设置项 $index")
                .put("toggle", index == 0))
        }))
    private fun descendants(view: View): List<View> = listOf(view) + if (view is ViewGroup)
        (0 until view.childCount).flatMap { descendants(view.getChildAt(it)) } else emptyList()
}
