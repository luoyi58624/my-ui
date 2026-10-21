package dev.myui.example

import android.app.Activity
import android.content.res.ColorStateList
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.util.TypedValue
import android.view.Gravity
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.luoyi.nativecomponents.NativeTabContent
import com.luoyi.nativecomponents.NativeTabViews
import com.luoyi.nativecomponents.NavigationIcon
import org.json.JSONObject

/** 为主导航与 Tabs 示例注册安卓页面视图，示例业务留在宿主中。 */
object DemoNativeTabs {
    /** 在 Activity 创建时注册示例页与个人中心，页面业务不进入通用插件。 */
    fun register() {
        NativeTabViews.register("demo") { activity, action -> DemoNativeTab(activity, action) }
        NativeTabViews.register("profile") { activity, action -> NativeProfileTab(activity, action) }
        NativeTabViews.register("settings") { activity, _ -> NativeSettingsTab(activity) }
    }
}

/** 独立的原生页面实例，切换 Tab 时不重新创建子控件。 */
private class DemoNativeTab(activity: Activity, action: (String) -> Unit) : NativeTabContent {
    override val view = LinearLayout(activity).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER }
    private val icon = ImageView(activity)
    private val badge = TextView(activity)
    private val title = TextView(activity)
    private val description = TextView(activity)
    private val counter = Button(activity)
    private val home = Button(activity)
    private var count = 0
    init {
        for (child in listOf(icon, badge, title, description, counter, home)) {
            if (child is TextView) {
                // 后续数据与主题更新只调整字重，不重新覆盖字体家族。
                child.typeface = Typeface.create("sans-serif", Typeface.NORMAL)
                child.includeFontPadding = false
                child.gravity = Gravity.CENTER
            }
            view.addView(child)
        }
        counter.setOnClickListener { count++; counter.text = "点一下 · $count"; action("increment") }
        home.setOnClickListener { action("home") }
    }

    override fun update(props: JSONObject, appearance: JSONObject, scale: Float) {
        fun px(value: Int) = (value * scale).toInt()
        val primary = appearance.getInt("primary")
        val muted = appearance.getInt("secondary")
        view.setBackgroundColor(appearance.getInt("surface"))
        view.setPadding(px(24), px(24), px(24), px(24))
        icon.setImageDrawable(NavigationIcon(props.getJSONArray("paths"), px(30)))
        icon.imageTintList = ColorStateList.valueOf(primary)
        icon.setPadding(px(21), px(21), px(21), px(21))
        icon.background = GradientDrawable().apply { cornerRadius = px(24).toFloat(); setColor(appearance.getInt("selected")) }
        icon.layoutParams = LinearLayout.LayoutParams(px(72), px(72)).apply { bottomMargin = px(24) }
        fun text(view: TextView, size: Int, color: Int, weight: Int) {
            view.setTextSize(TypedValue.COMPLEX_UNIT_PX, size * scale)
            view.setTextColor(color)
            if (Build.VERSION.SDK_INT >= 26) view.fontVariationSettings = "'wght' $weight"
            else view.setTypeface(view.typeface, if (weight >= 600) Typeface.BOLD else Typeface.NORMAL)
        }
        badge.text = props.optString("badge", "DEMO ${props.optInt("demo")}"); text(badge, 11, muted, appearance.getInt("fontWeight"))
        badge.letterSpacing = .15f
        title.text = props.optString("title", props.getString("label")); text(title, 24, appearance.getInt("text"), appearance.getInt("titleWeight"))
        title.layoutParams = LinearLayout.LayoutParams(-1, -2).apply { topMargin = px(10); bottomMargin = px(10) }
        description.text = props.optString("description", "这是预留的 Demo 页面。"); text(description, 14, muted, appearance.getInt("fontWeight"))
        description.layoutParams = LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = px(28) }
        count = props.optInt("count")
        counter.text = "点一下 · $count"; home.text = props.optString("homeLabel", "浏览组件")
        for (button in listOf(counter, home)) {
            text(button, 14, primary, appearance.getInt("fontWeight"))
            button.isAllCaps = false
            button.minHeight = 0; button.minimumHeight = 0; button.minWidth = 0; button.minimumWidth = 0
            button.layoutParams = LinearLayout.LayoutParams(px(160), px(44)).apply { topMargin = px(10) }
            button.backgroundTintList = ColorStateList.valueOf(appearance.getInt("selected"))
        }
    }
}
