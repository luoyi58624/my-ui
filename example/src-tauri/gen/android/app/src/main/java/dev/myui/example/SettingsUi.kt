package dev.myui.example

import android.app.Activity
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.InsetDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.text.TextUtils
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.graphics.ColorUtils
import androidx.appcompat.widget.SwitchCompat
import com.luoyi.nativecomponents.NavigationIcon
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.roundToInt

/** 设置 UI 共用的行、卡片和排版；主题更新原地应用，不重建有交互状态的控件。 */
internal class SettingsUi(private val activity: Activity, var appearance: JSONObject, val scale: Float) {
    private data class Label(val view: TextView, val muted: Boolean, val heading: Boolean)
    private val labels = mutableListOf<Label>()
    private val cards = mutableListOf<GradientDrawable>()
    private val ripples = mutableListOf<RippleDrawable>()
    val dark get() = ColorUtils.calculateLuminance(appearance.optInt("surface", Color.WHITE)) < .5
    val background get() = if (dark) 0xff101114.toInt() else 0xffeff0f2.toInt()
    val surface get() = if (dark) 0xff202124.toInt() else Color.WHITE
    val foreground get() = appearance.optInt("text", Color.BLACK)
    val secondary get() = appearance.optInt("secondary", Color.GRAY)
    val accent = 0xff12b52b.toInt()

    fun dp(value: Int) = (value * scale).roundToInt()
    fun column() = LinearLayout(activity).apply { orientation = LinearLayout.VERTICAL }
    fun shape(color: Int, radius: Int) = GradientDrawable().apply { setColor(color); cornerRadius = dp(radius).toFloat() }
    fun text(value: String, size: Int, muted: Boolean = false, heading: Boolean = false) = TextView(activity).apply {
        text = value
        includeFontPadding = false
        // 字体家族只在创建时赋值，切换与配色更新不能覆盖可变字重。
        typeface = Typeface.create("sans-serif", if (heading) Typeface.BOLD else Typeface.NORMAL)
        setTextSize(TypedValue.COMPLEX_UNIT_PX, size * scale)
        labels.add(Label(this, muted, heading))
        style(labels.last())
    }
    private fun style(label: Label) {
        label.view.setTextColor(if (label.muted) secondary else foreground)
        val weight = if (label.heading) maxOf(700, appearance.optInt("titleWeight", 600)) else appearance.optInt("fontWeight", 500)
        if (Build.VERSION.SDK_INT >= 26 && label.view.fontVariationSettings != "'wght' $weight") label.view.fontVariationSettings = "'wght' $weight"
    }
    fun refresh(next: JSONObject) {
        appearance = next
        labels.forEach(::style)
        cards.forEach { it.setColor(surface) }
        ripples.forEach { it.setColor(ColorStateList.valueOf(ColorUtils.setAlphaComponent(foreground, 22))) }
    }
    fun icon(paths: JSONArray, size: Int = 24, color: Int = secondary) = ImageView(activity).apply {
        setImageDrawable(NavigationIcon(paths, dp(size)).apply { setTint(color) })
        importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
    }
    fun icon(path: String, size: Int = 24, color: Int = secondary) = icon(JSONArray().put(path), size, color)
    fun ripple() = RippleDrawable(ColorStateList.valueOf(ColorUtils.setAlphaComponent(foreground, 22)), null, ColorDrawable(Color.WHITE)).also(ripples::add)
    fun card() = column().apply {
        background = shape(surface, 24).also(cards::add)
        clipToOutline = true
    }
    fun divider() = View(activity).apply {
        setBackgroundColor(if (dark) 0xff343538.toInt() else 0xffeeeeef.toInt())
        layoutParams = LinearLayout.LayoutParams(-1, maxOf(1, dp(1) / 2)).apply { marginStart = dp(56); marginEnd = dp(16) }
    }
    fun row(spec: JSONObject, clicked: () -> Unit): LinearLayout = LinearLayout(activity).apply {
        tag = "settings-row-" + spec.optString("id")
        gravity = Gravity.CENTER_VERTICAL
        minimumHeight = dp(52)
        setPadding(dp(16), dp(10), dp(16), dp(10))
        foreground = ripple()
        isClickable = true
        isFocusable = true
        val paths = spec.optJSONArray("paths")
        if (paths != null) addView(icon(paths, color = Color.parseColor(spec.optString("color", "#4144f2"))), LinearLayout.LayoutParams(dp(24), dp(24)).apply { marginEnd = dp(16) })
        val label = text(spec.getString("title"), 17).apply { maxLines = 2; ellipsize = TextUtils.TruncateAt.END }
        addView(label, LinearLayout.LayoutParams(0, -2, 1f))
        if (spec.optBoolean("toggle")) {
            val toggle = SwitchCompat(activity).apply {
                tag = "settings-toggle-" + spec.optString("id")
                contentDescription = spec.getString("title")
                minimumHeight = 0
                minimumWidth = 0
                showText = false
                splitTrack = false
                switchMinWidth = dp(48)
                thumbDrawable = InsetDrawable(GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(Color.WHITE); setSize(dp(24), dp(24)) }, dp(2))
                trackDrawable = shape(0xffd6d7d9.toInt(), 14).apply { setSize(dp(48), dp(28)) }
                thumbTintList = ColorStateList.valueOf(Color.WHITE)
                trackTintList = ColorStateList(arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf()), intArrayOf(accent, 0xffd6d7d9.toInt()))
            }
            addView(toggle, LinearLayout.LayoutParams(dp(52), dp(32)).apply { marginStart = dp(12) })
            setOnClickListener { toggle.isChecked = !toggle.isChecked }
        } else {
            val summary = spec.optString("summary")
            if (summary.isNotEmpty()) addView(text(summary, 14, muted = true), LinearLayout.LayoutParams(-2, -2).apply { marginStart = dp(12) })
            addView(icon("m9 5 7 7-7 7", 16, 0xffb7b8bb.toInt()), LinearLayout.LayoutParams(dp(16), dp(16)).apply { marginStart = dp(8) })
            setOnClickListener { clicked() }
        }
    }
    fun group(items: JSONArray, clicked: (JSONObject) -> Unit) = card().apply {
        for (index in 0 until items.length()) {
            val item = items.getJSONObject(index)
            if (index > 0) addView(divider())
            addView(row(item) { clicked(item) }, LinearLayout.LayoutParams(-1, -2))
        }
    }
    fun addGroup(parent: LinearLayout, group: View) {
        parent.addView(group, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(16) })
    }
}
