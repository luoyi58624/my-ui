package dev.myui.example

import android.app.Activity
import android.content.Intent
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import com.luoyi.nativecomponents.NativeTabContent
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.max

/** 设置首页自己管理大标题和吸顶搜索，不借用 App 的公共导航头。 */
internal class NativeSettingsTab(private val activity: Activity) : NativeTabContent {
    override val view = FrameLayout(activity).apply { tag = "native-settings"; clipChildren = true }
    private var ui: SettingsUi? = null
    private var groups = JSONArray()
    private var refreshSurface: (() -> Unit)? = null

    override fun update(props: JSONObject, appearance: JSONObject, scale: Float) {
        val current = ui
        if (current != null) {
            current.refresh(appearance)
            view.setBackgroundColor(current.background)
            refreshSurface?.invoke()
            return
        }
        val theme = SettingsUi(activity, appearance, scale)
        ui = theme
        groups = props.optJSONArray("groups") ?: JSONArray()
        view.setBackgroundColor(theme.background)
        val scroller = ScrollView(activity).apply { tag = "settings-scroll"; isFillViewport = true; clipToPadding = false }
        val content = theme.column()
        scroller.addView(content, FrameLayout.LayoutParams(-1, -2))
        view.addView(scroller, FrameLayout.LayoutParams(-1, -1))
        content.addView(theme.text("设置", 40, heading = true).apply {
            tag = "settings-large-title"
            gravity = Gravity.BOTTOM
            setPadding(theme.dp(24), 0, theme.dp(24), theme.dp(20))
        }, LinearLayout.LayoutParams(-1, theme.dp(116)))
        content.addView(View(activity), LinearLayout.LayoutParams(-1, theme.dp(52)))
        val body = theme.column().apply { setPadding(theme.dp(16), theme.dp(16), theme.dp(16), theme.dp(28)) }
        content.addView(body, LinearLayout.LayoutParams(-1, -2))
        theme.addGroup(body, account(props.optJSONObject("account") ?: JSONObject().put("title", "小蓝同学"), theme))
        for (index in 0 until groups.length()) theme.addGroup(body, theme.group(groups.getJSONArray(index)) { open(it) })

        val search = FrameLayout(activity).apply { tag = "settings-search"; setPadding(theme.dp(16), theme.dp(6), theme.dp(16), theme.dp(6)) }
        val field = LinearLayout(activity).apply {
            tag = "settings-search-field"
            gravity = Gravity.CENTER_VERTICAL
            setPadding(theme.dp(14), 0, theme.dp(14), 0)
            background = theme.shape(if (theme.dark) 0xee303136.toInt() else 0xeef9f9fa.toInt(), 24)
            foreground = theme.ripple()
            isClickable = true
            isFocusable = true
            contentDescription = "搜索设置项"
            addView(theme.icon("M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6"), LinearLayout.LayoutParams(theme.dp(22), theme.dp(22)))
            addView(theme.text("搜索设置项", 16, muted = true), LinearLayout.LayoutParams(0, -2, 1f).apply { marginStart = theme.dp(10) })
            addView(theme.icon("M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3"), LinearLayout.LayoutParams(theme.dp(22), theme.dp(22)))
            setOnClickListener { open(JSONObject().put("id", "search").put("title", "搜索设置项")) }
        }
        search.addView(field, FrameLayout.LayoutParams(-1, -1))
        view.addView(search, FrameLayout.LayoutParams(-1, theme.dp(52)))
        fun position() {
            search.translationY = max(0, theme.dp(116) - scroller.scrollY).toFloat()
            search.setBackgroundColor(if (scroller.scrollY >= theme.dp(116)) theme.background else android.graphics.Color.TRANSPARENT)
            search.elevation = if (scroller.scrollY > theme.dp(116)) theme.dp(2).toFloat() else 0f
        }
        scroller.setOnScrollChangeListener { _, _, _, _, _ -> position() }
        refreshSurface = {
            field.background = theme.shape(if (theme.dark) 0xee303136.toInt() else 0xeef9f9fa.toInt(), 24)
            position()
        }
        position()
    }

    private fun account(data: JSONObject, theme: SettingsUi) = theme.card().apply {
        tag = "settings-account"
        val row = LinearLayout(activity).apply {
            gravity = Gravity.CENTER_VERTICAL
            minimumHeight = theme.dp(88)
            setPadding(theme.dp(16), theme.dp(16), theme.dp(16), theme.dp(16))
            foreground = theme.ripple()
            isClickable = true
            isFocusable = true
            val avatar = theme.icon(data.optJSONArray("paths") ?: JSONArray().put("M4 20a8 8 0 0 1 16 0M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8"), 32).apply {
                background = theme.shape(0xffe3e4e6.toInt(), 28)
                setPadding(theme.dp(12), theme.dp(12), theme.dp(12), theme.dp(12))
            }
            addView(avatar, LinearLayout.LayoutParams(theme.dp(56), theme.dp(56)))
            val text = theme.column().apply {
                addView(theme.text(data.optString("title"), 21, heading = true))
                addView(theme.text(data.optString("summary", "管理账号、云服务与偏好"), 12, muted = true), LinearLayout.LayoutParams(-1, -2).apply { topMargin = theme.dp(5) })
            }
            addView(text, LinearLayout.LayoutParams(0, -2, 1f).apply { marginStart = theme.dp(16); marginEnd = theme.dp(8) })
            addView(theme.icon("m9 5 7 7-7 7", 16, 0xffb7b8bb.toInt()), LinearLayout.LayoutParams(theme.dp(16), theme.dp(16)))
            setOnClickListener { open(JSONObject().put("id", "account").put("title", "账号与备份")) }
        }
        addView(row, LinearLayout.LayoutParams(-1, -2))
    }

    private fun open(item: JSONObject) {
        activity.startActivity(Intent(activity, NativeSettingsActivity::class.java)
            .putExtra("item", item.toString()).putExtra("groups", groups.toString())
            .putExtra("appearance", ui!!.appearance.toString()))
    }
}
