package dev.myui.example

import android.content.res.ColorStateList
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.graphics.ColorUtils
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.luoyi.nativecomponents.NavigationIcon
import org.json.JSONArray
import org.json.JSONObject

/** 独立的 Android 原生资料页，普通 Activity 栈负责返回，不创建 Tauri 窗口或 WebView。 */
class NativeProfileActivity : AppCompatActivity() {
    companion object {
        /** 从个人中心继承当前外观，原生页的首帧与来源页面保持一致。 */
        const val APPEARANCE = "dev.myui.example.profile.appearance"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val appearance = runCatching { JSONObject(intent.getStringExtra(APPEARANCE) ?: "{}") }.getOrDefault(JSONObject())
        if (appearance.has("surface")) {
            delegate.localNightMode = if (ColorUtils.calculateLuminance(appearance.getInt("surface")) < .5)
                AppCompatDelegate.MODE_NIGHT_YES else AppCompatDelegate.MODE_NIGHT_NO
        }
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContentView(R.layout.activity_native_profile)

        val root = findViewById<View>(R.id.profile_root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, keyboard.bottom))
            insets
        }
        ViewCompat.requestApplyInsets(root)

        val toolbar = findViewById<MaterialToolbar>(R.id.profile_toolbar)
        toolbar.navigationIcon = NavigationIcon(JSONArray(arrayOf("M19 12H5", "M12 19l-7-7 7-7")), dp(24))
        toolbar.navigationContentDescription = "返回"
        toolbar.setNavigationOnClickListener { finish() }

        val preferences = NativeProfileStore.preferences(this)
        val profile = NativeProfileStore.read(preferences)
        val name = findViewById<TextInputEditText>(R.id.profile_name)
        val signature = findViewById<TextInputEditText>(R.id.profile_signature)
        val showSignature = findViewById<MaterialSwitch>(R.id.profile_show_signature)
        val nameField = findViewById<TextInputLayout>(R.id.profile_name_field)
        val save = findViewById<MaterialButton>(R.id.profile_save)
        name.setText(profile.name)
        signature.setText(profile.signature)
        showSignature.isChecked = profile.showSignature
        val avatar = findViewById<TextView>(R.id.profile_avatar)
        name.doAfterTextChanged {
            avatar.text = it?.toString()?.trim()?.take(1).orEmpty().ifEmpty { "我" }
            nameField.error = null
        }
        avatar.text = profile.name.take(1)
        save.setOnClickListener {
            val next = NativeProfileStore.Profile(name.text.toString(), signature.text.toString(), showSignature.isChecked)
            if (!NativeProfileStore.save(preferences, next)) {
                nameField.error = "请填写昵称"
                name.requestFocus()
                return@setOnClickListener
            }
            setResult(RESULT_OK)
            finish()
        }

        applyAppearance(appearance, root, toolbar, avatar, save, name, signature, nameField)
    }

    private fun applyAppearance(
        appearance: JSONObject, root: View, toolbar: MaterialToolbar, avatar: TextView,
        save: MaterialButton, name: TextInputEditText, signature: TextInputEditText, nameField: TextInputLayout,
    ) {
        if (!appearance.has("surface")) return
        val surface = appearance.getInt("surface")
        val text = appearance.getInt("text")
        val secondary = appearance.getInt("secondary")
        val primary = appearance.getInt("primary")
        val selected = appearance.getInt("selected")
        val onPrimary = if (ColorUtils.calculateLuminance(primary) > .5) android.graphics.Color.BLACK else android.graphics.Color.WHITE
        root.setBackgroundColor(surface)
        toolbar.setBackgroundColor(surface)
        toolbar.setTitleTextColor(text)
        toolbar.navigationIcon?.setTint(text)
        avatar.background = GradientDrawable().apply { setColor(selected); cornerRadius = dp(24).toFloat() }
        avatar.setTextColor(primary)
        save.backgroundTintList = ColorStateList.valueOf(primary)
        save.setTextColor(onPrimary)
        name.setTextColor(text); signature.setTextColor(text)
        if (Build.VERSION.SDK_INT >= 29) {
            for (input in listOf(name, signature)) {
                listOfNotNull(input.textCursorDrawable, input.textSelectHandle, input.textSelectHandleLeft, input.textSelectHandleRight)
                    .forEach { it.mutate().setTint(primary) }
            }
        }
        for (field in listOf(nameField, findViewById<TextInputLayout>(R.id.profile_signature_field))) {
            field.defaultHintTextColor = ColorStateList.valueOf(secondary)
            field.hintTextColor = ColorStateList.valueOf(primary)
            field.boxStrokeColor = primary
        }
        findViewById<TextView>(R.id.profile_heading).setTextColor(text)
        findViewById<TextView>(R.id.profile_description).setTextColor(secondary)
        findViewById<TextView>(R.id.profile_preference_description).setTextColor(secondary)
        findViewById<MaterialSwitch>(R.id.profile_show_signature).apply {
            setTextColor(text)
            val states = arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf())
            thumbTintList = ColorStateList(states, intArrayOf(onPrimary, secondary))
            trackTintList = ColorStateList(states, intArrayOf(primary, ColorUtils.blendARGB(surface, text, .12f)))
        }
        val light = ColorUtils.calculateLuminance(surface) >= .5
        WindowCompat.getInsetsController(window, root).apply {
            isAppearanceLightStatusBars = light
            isAppearanceLightNavigationBars = light
        }
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
}
