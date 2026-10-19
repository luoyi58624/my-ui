package com.luoyi.systemfontweight

import kotlin.math.abs

/** 安卓厂商判定（字重语境下的"平台"），移植自 Flutter 版 vendor.dart。 */
internal enum class AndroidFontVendor {
    /** OPPO / OnePlus / Realme（ColorOS 系） */
    OPPO,

    /** 小米 / Redmi / POCO（HyperOS / MIUI） */
    XIAOMI,

    /** vivo / iQOO（OriginOS） */
    VIVO,

    /** 荣耀（MagicOS） */
    HONOR,

    /** 华为（HarmonyOS 安卓底座机型） */
    HUAWEI,

    /** 三星（OneUI） */
    SAMSUNG,

    /** 其他安卓厂商 */
    OTHER,
}

/**
 * 根据原始采集结果选取字重，移植自 Flutter 版 logic.dart 的 resolveWght。
 *
 * 仅处理 OPPO 系、小米系、vivo 系和荣耀，其他设备返回 null。
 * OPPO 使用通过校验的探针（含默认 400）；其余厂商优先使用偏离 400 的
 * 有效探针，再尝试指定字段中的绝对字重。不推断开关、倍率、档位或滑杆编码。
 */
internal object FontWeightPolicy {
    /** 从设备制造商与品牌识别厂商，旧华为制造的荣耀设备仍归入华为。 */
    private fun vendorOf(manufacturer: String, brand: String): AndroidFontVendor {
        val m = ("$manufacturer $brand").lowercase()
        return when {
            m.contains("huawei") -> AndroidFontVendor.HUAWEI
            m.contains("samsung") -> AndroidFontVendor.SAMSUNG
            m.contains("oppo") || m.contains("oneplus") || m.contains("realme") ->
                AndroidFontVendor.OPPO
            m.contains("xiaomi") || m.contains("redmi") || m.contains("poco") ->
                AndroidFontVendor.XIAOMI
            m.contains("vivo") || m.contains("iqoo") -> AndroidFontVendor.VIVO
            m.contains("honor") -> AndroidFontVendor.HONOR
            else -> AndroidFontVendor.OTHER
        }
    }

    fun resolveWght(all: Map<String, String>): Double? {
        val vendor = vendorOf(all["manufacturer"] ?: "", all["brand"] ?: "")
        if (vendor != AndroidFontVendor.OPPO &&
            vendor != AndroidFontVendor.XIAOMI &&
            vendor != AndroidFontVendor.VIVO &&
            vendor != AndroidFontVendor.HONOR
        ) {
            return null
        }

        // 旧版探针没有有效性标记，可能把不支持 wght 轴误报成 100。
        val probe = if (all["probeStatus"] == "valid") absoluteWght(all["probeNativeWght"]) else null
        if (probe != null) {
            if (vendor == AndroidFontVendor.OPPO || abs(probe - 400) > 8) {
                return probe
            }
        }

        // ColorOS 存的是滑杆刻度，探针失败时不能当作实际生效字重；
        // 小米等字段名仅接受绝对字重，不猜测 scale 的编码。
        val vendorKeys = when (vendor) {
            AndroidFontVendor.XIAOMI -> listOf("candidate:system/key_miui_font_weight")
            AndroidFontVendor.VIVO -> listOf("candidate:system/vivo_font_weight")
            AndroidFontVendor.HONOR -> listOf("candidate:system/hn_font_weight")
            else -> emptyList()
        }
        for (key in vendorKeys) {
            val wght = absoluteWght(all[key])
            if (wght != null) return wght
        }
        return null
    }

    private val WGHT_VARIATION = Regex(
        """(?:^|,)\s*(['"])wght\1\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?=,|$)"""
    )

    /** 解析 "'wght' 500" 形态或纯数字，仅接受 100–1000 的有限值。 */
    private fun absoluteWght(raw: String?): Double? {
        if (raw == null) return null
        val trimmed = raw.trim()
        val variation = WGHT_VARIATION.find(trimmed)
        val v = if (variation != null) {
            variation.groupValues[2].toDoubleOrNull()
        } else {
            trimmed.toDoubleOrNull()
        }
        return v?.takeIf { it.isFinite() && it in 100.0..1000.0 }
    }
}
