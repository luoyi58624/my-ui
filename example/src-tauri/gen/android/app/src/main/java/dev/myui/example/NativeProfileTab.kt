package dev.myui.example

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.graphics.ColorUtils
import com.luoyi.nativecomponents.NativeTabContent
import com.luoyi.nativecomponents.NavigationIcon
import org.json.JSONArray
import org.json.JSONObject

/** “我的”原生个人中心，通过普通 Intent 打开完整的 Android 资料页。 */
internal class NativeProfileTab(private val activity: Activity, action: (String) -> Unit) : NativeTabContent {
    override val view = ScrollView(activity).apply { isFillViewport = true; clipToPadding = false }
    private val content = LinearLayout(activity).apply { orientation = LinearLayout.VERTICAL }
    private val avatar = TextView(activity)
    private val name = TextView(activity)
    private val signature = TextView(activity)
    private val section = TextView(activity).apply { text = "账号与偏好" }
    private val card = LinearLayout(activity).apply { orientation = LinearLayout.VERTICAL }
    private val details = row("个人资料", "昵称、个性签名与展示偏好", arrayOf("M20 21v-2a7 7 0 0 0-14 0v2", "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0"))
    private val browse = row("浏览组件", "发现更多界面与交互", arrayOf("M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"))
    private val divider = View(activity)
    private val preferences = NativeProfileStore.preferences(activity)
    private val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ -> bindProfile() }
    private var appearance = JSONObject()
    private var scale = activity.resources.displayMetrics.density

    init {
        view.addView(content)
        content.addView(avatar)
        content.addView(name)
        content.addView(signature)
        content.addView(section)
        content.addView(card)
        card.addView(details.root)
        card.addView(divider)
        card.addView(browse.root)
        details.root.setOnClickListener {
            activity.startActivity(Intent(activity, NativeProfileActivity::class.java)
                .putExtra(NativeProfileActivity.APPEARANCE, appearance.toString()))
        }
        browse.root.setOnClickListener { action("home") }
        preferences.registerOnSharedPreferenceChangeListener(listener)
        bindProfile()
    }

    private data class Row(val root: LinearLayout, val icon: ImageView, val title: TextView, val description: TextView, val arrow: ImageView)

    private fun row(title: String, description: String, paths: Array<String>): Row {
        val root = LinearLayout(activity).apply { gravity = Gravity.CENTER_VERTICAL; isClickable = true; isFocusable = true }
        val icon = ImageView(activity).apply { setImageDrawable(NavigationIcon(JSONArray(paths), 24)) }
        val text = LinearLayout(activity).apply { orientation = LinearLayout.VERTICAL }
        val heading = TextView(activity).apply { this.text = title }
        val caption = TextView(activity).apply { this.text = description }
        val arrow = ImageView(activity).apply { setImageDrawable(NavigationIcon(JSONArray(arrayOf("M9 5l7 7-7 7")), 20)) }
        text.addView(heading); text.addView(caption)
        root.addView(icon); root.addView(text, LinearLayout.LayoutParams(0, -2, 1f)); root.addView(arrow)
        return Row(root, icon, heading, caption, arrow)
    }

    private fun bindProfile() {
        val profile = NativeProfileStore.read(preferences)
        avatar.text = profile.name.take(1)
        avatar.contentDescription = "${profile.name}的头像"
        name.text = profile.name
        signature.text = profile.signature
        signature.visibility = if (profile.showSignature && profile.signature.isNotEmpty()) View.VISIBLE else View.GONE
    }

    override fun update(props: JSONObject, appearance: JSONObject, scale: Float) {
        this.appearance = JSONObject(appearance.toString())
        this.scale = scale
        val surface = appearance.getInt("surface")
        val foreground = appearance.getInt("text")
        val secondary = appearance.getInt("secondary")
        val primary = appearance.getInt("primary")
        val selected = appearance.getInt("selected")
        view.setBackgroundColor(surface)
        content.setPadding(px(24), px(36), px(24), px(24))
        avatar.gravity = Gravity.CENTER
        avatar.background = rounded(selected, 24)
        avatar.layoutParams = LinearLayout.LayoutParams(px(80), px(80)).apply { bottomMargin = px(20) }
        style(avatar, 30, primary, appearance.getInt("titleWeight"))
        style(name, 26, foreground, appearance.getInt("titleWeight"))
        name.layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = px(10) }
        style(signature, 14, secondary, appearance.getInt("fontWeight"))
        signature.setLineSpacing(px(4).toFloat(), 1f)
        style(section, 12, secondary, appearance.getInt("fontWeight"))
        section.layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = px(40); bottomMargin = px(12) }
        card.background = rounded(ColorUtils.blendARGB(surface, foreground, .035f), 20)
        card.clipToOutline = true
        divider.setBackgroundColor(ColorUtils.blendARGB(surface, foreground, .08f))
        divider.layoutParams = LinearLayout.LayoutParams(-1, px(1).coerceAtLeast(1)).apply { marginStart = px(60); marginEnd = px(18) }
        for (row in listOf(details, browse)) {
            row.root.minimumHeight = px(84)
            row.root.setPadding(px(18), px(18), px(18), px(18))
            row.root.background = RippleDrawable(ColorStateList.valueOf(ColorUtils.setAlphaComponent(primary, 30)), null, null)
            row.icon.imageTintList = ColorStateList.valueOf(primary)
            row.icon.layoutParams = LinearLayout.LayoutParams(px(24), px(24)).apply { marginEnd = px(16) }
            style(row.title, 16, foreground, appearance.getInt("fontWeight"))
            style(row.description, 12, secondary, appearance.getInt("fontWeight"))
            row.description.layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = px(5) }
            row.arrow.imageTintList = ColorStateList.valueOf(secondary)
            row.arrow.layoutParams = LinearLayout.LayoutParams(px(18), px(18)).apply { marginStart = px(12) }
        }
    }

    private fun px(value: Int) = (value * scale).toInt()
    private fun rounded(color: Int, radius: Int) = GradientDrawable().apply { setColor(color); cornerRadius = px(radius).toFloat() }
    private fun style(view: TextView, size: Int, color: Int, weight: Int) {
        view.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, size * scale)
        view.setTextColor(color)
        view.includeFontPadding = false
        view.typeface = Typeface.create("sans-serif", Typeface.NORMAL)
        if (Build.VERSION.SDK_INT >= 26) view.fontVariationSettings = "'wght' $weight"
        else view.setTypeface(view.typeface, if (weight >= 600) Typeface.BOLD else Typeface.NORMAL)
    }

    override fun dispose() { preferences.unregisterOnSharedPreferenceChangeListener(listener) }
}
