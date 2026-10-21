package dev.myui.example

import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.ScrollView
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.graphics.ColorUtils
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import org.json.JSONArray
import org.json.JSONObject

/** 设置子页只演示原生导航、搜索与控件状态，不读写任何系统设置。 */
class NativeSettingsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val appearance = JSONObject(intent.getStringExtra("appearance") ?: "{}")
        if (appearance.has("surface")) delegate.localNightMode = if (ColorUtils.calculateLuminance(appearance.getInt("surface")) < .5) AppCompatDelegate.MODE_NIGHT_YES else AppCompatDelegate.MODE_NIGHT_NO
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val ui = SettingsUi(this, appearance, resources.displayMetrics.density)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = ui.background
        val item = JSONObject(intent.getStringExtra("item") ?: "{\"id\":\"display\",\"title\":\"显示与亮度\"}")
        val groups = JSONArray(intent.getStringExtra("groups") ?: "[]")
        val root = ui.column().apply { tag = "native-settings-detail"; setBackgroundColor(ui.background) }
        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { node, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            node.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, insets.getInsets(WindowInsetsCompat.Type.ime()).bottom))
            insets
        }
        ViewCompat.requestApplyInsets(root)
        WindowCompat.getInsetsController(window, root).isAppearanceLightStatusBars = !ui.dark
        val header = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL; setPadding(ui.dp(16), ui.dp(8), ui.dp(16), ui.dp(8)) }
        root.addView(header, LinearLayout.LayoutParams(-1, ui.dp(64)))
        header.addView(ui.icon("M20 12H4m8-8-8 8 8 8", color = ui.foreground).apply {
            tag = "settings-back"
            contentDescription = "返回"
            background = ui.shape(if (ui.dark) 0xff303136.toInt() else 0xfff9f9fa.toInt(), 20)
            foreground = ui.ripple()
            setPadding(ui.dp(9), ui.dp(9), ui.dp(9), ui.dp(9))
            importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
            isFocusable = true
            setOnClickListener { finish() }
        }, LinearLayout.LayoutParams(ui.dp(40), ui.dp(40)))
        val scroller = ScrollView(this).apply { isFillViewport = true }
        val content = ui.column().apply { setPadding(ui.dp(16), ui.dp(12), ui.dp(16), ui.dp(28)) }
        scroller.addView(content, FrameLayout.LayoutParams(-1, -2))
        root.addView(scroller, LinearLayout.LayoutParams(-1, 0, 1f))
        if (item.optString("id") == "search") {
            val field = EditText(this).apply {
                tag = "settings-search-input"
                hint = "搜索设置项"
                setSingleLine()
                textSize = 16f
                setTextColor(ui.foreground)
                setHintTextColor(ui.secondary)
                background = ui.shape(ui.surface, 24)
                setPadding(ui.dp(14), 0, ui.dp(14), 0)
            }
            header.addView(field, LinearLayout.LayoutParams(0, ui.dp(40), 1f).apply { marginStart = ui.dp(12) })
            val all = (0 until groups.length()).flatMap { group -> groups.getJSONArray(group).let { (0 until it.length()).map(it::getJSONObject) } }
            fun results(query: String) {
                content.removeAllViews()
                val matches = all.filter { query.isNotBlank() && it.getString("title").contains(query, ignoreCase = true) }
                if (matches.isNotEmpty()) ui.addGroup(content, ui.group(JSONArray(matches)) { selected -> open(selected, appearance, groups) })
                else content.addView(ui.text(if (query.isBlank()) "搜索设置项" else "没有找到相关设置", 14, muted = true).apply { gravity = Gravity.CENTER; setPadding(0, ui.dp(36), 0, 0) })
            }
            field.doAfterTextChanged { results(it.toString()) }
            results("")
            field.post { field.requestFocus(); (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager).showSoftInput(field, 0) }
        } else {
            header.addView(ui.text(item.optString("title"), 18, heading = true), LinearLayout.LayoutParams(0, -2, 1f).apply { marginStart = ui.dp(12) })
            if (item.optString("id") == "display") display(content, ui)
            else {
                val rows = if (item.optString("id") == "account") listOf("个人资料", "账号安全", "云服务") else listOf(item.optString("title"), "自动连接", "更多设置")
                ui.addGroup(content, ui.group(JSONArray().apply { rows.forEachIndexed { index, title -> put(JSONObject().put("id", "preview-$index").put("title", title).put("toggle", index < 2)) } }) {})
            }
        }
    }

    private fun open(item: JSONObject, appearance: JSONObject, groups: JSONArray) {
        startActivity(Intent(this, NativeSettingsActivity::class.java).putExtra("item", item.toString())
            .putExtra("appearance", appearance.toString()).putExtra("groups", groups.toString()))
    }

    private fun display(content: LinearLayout, ui: SettingsUi) {
        val card = ui.card()
        val choices = LinearLayout(this).apply { gravity = Gravity.CENTER; setPadding(ui.dp(16), ui.dp(28), ui.dp(16), ui.dp(16)) }
        val radios = mutableListOf<RadioButton>()
        for ((index, title) in listOf("亮色模式", "暗色模式").withIndex()) {
            val choice = ui.column().apply { gravity = Gravity.CENTER }
            val phone = FrameLayout(this).apply {
                background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(if (index == 0) 0xff8dc9f4.toInt() else 0xff21629b.toInt(), 0xff72cdd4.toInt())).apply { cornerRadius = ui.dp(14).toFloat(); setStroke(ui.dp(2), 0xff656c71.toInt()) }
                addView(ui.text("10:30", 16).apply { setTextColor(Color.WHITE); gravity = Gravity.CENTER }, FrameLayout.LayoutParams(-1, ui.dp(56)))
            }
            choice.addView(phone, LinearLayout.LayoutParams(ui.dp(64), ui.dp(132)))
            choice.addView(ui.text(title, 14, muted = true), LinearLayout.LayoutParams(-2, -2).apply { topMargin = ui.dp(20) })
            val radio = RadioButton(this).apply { contentDescription = title; buttonTintList = ColorStateList(arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf()), intArrayOf(ui.accent, 0xffbfc1c4.toInt())) }
            radios.add(radio)
            choice.addView(radio, LinearLayout.LayoutParams(ui.dp(40), ui.dp(40)))
            fun select() { radios.forEachIndexed { selected, view -> view.isChecked = selected == index } }
            radio.setOnClickListener { select() }
            choice.setOnClickListener { select() }
            choices.addView(choice, LinearLayout.LayoutParams(0, -2, 1f))
        }
        radios.first().isChecked = true
        card.addView(choices)
        card.addView(ui.divider())
        card.addView(ui.row(JSONObject().put("id", "automatic-theme").put("title", "自动切换").put("toggle", true)) {})
        ui.addGroup(content, card)
        content.addView(ui.text("亮度", 13, muted = true), LinearLayout.LayoutParams(-1, -2).apply { topMargin = ui.dp(10); bottomMargin = ui.dp(10); marginStart = ui.dp(16) })
        val brightness = ui.card()
        brightness.addView(SeekBar(this).apply {
            tag = "settings-brightness"
            contentDescription = "亮度"
            max = 100
            progress = 35
            progressTintList = ColorStateList.valueOf(ui.accent)
            thumbTintList = ColorStateList.valueOf(ui.accent)
            setPadding(ui.dp(24), ui.dp(8), ui.dp(24), ui.dp(8))
        }, LinearLayout.LayoutParams(-1, ui.dp(64)))
        brightness.addView(ui.divider())
        brightness.addView(ui.row(JSONObject().put("id", "automatic-brightness").put("title", "自动调节").put("toggle", true)) {})
        ui.addGroup(content, brightness)
        content.addView(ui.text("舒适显示", 13, muted = true), LinearLayout.LayoutParams(-1, -2).apply { topMargin = ui.dp(10); bottomMargin = ui.dp(10); marginStart = ui.dp(16) })
        ui.addGroup(content, ui.group(JSONArray().put(JSONObject().put("id", "eye-comfort").put("title", "明眸护眼")).put(JSONObject().put("id", "screen-color").put("title", "屏幕色彩模式"))) {})
    }
}
