package dev.myui.example

import android.content.Context
import android.content.SharedPreferences

/** 个人中心与资料页共用的本地资料，不依赖 WebView 或网页存储。 */
internal object NativeProfileStore {
    /** 昵称、签名及其展示偏好一次保存，返回个人中心时统一刷新。 */
    data class Profile(val name: String, val signature: String, val showSignature: Boolean)

    /** 仅访问本示例的个人资料，避免与主题、其他示例的存储混用。 */
    fun preferences(context: Context): SharedPreferences =
        context.getSharedPreferences("native-profile", Context.MODE_PRIVATE)

    /** 读取上次保存的资料，首次使用时显示示例账号。 */
    fun read(preferences: SharedPreferences) = Profile(
        preferences.getString("name", null) ?: "小蓝同学",
        preferences.getString("signature", null) ?: "让每一天，都有一点新发现。",
        preferences.getBoolean("showSignature", true),
    )

    /** 校验和提交在原生侧完成，空昵称不会覆盖已有资料。 */
    fun save(preferences: SharedPreferences, profile: Profile): Boolean {
        val name = profile.name.trim()
        if (name.isEmpty() || name.codePointCount(0, name.length) > 24) return false
        preferences.edit()
            .putString("name", name)
            .putString("signature", profile.signature.trim())
            .putBoolean("showSignature", profile.showSignature)
            .apply()
        return true
    }
}
